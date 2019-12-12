/** 
 * @author github.com/tintinweb
 * @license MIT
 *
 * */
'use strict'

/** imports */
const YAML = require('yaml');
const fs = require('fs');
const dao = require('./dao')

function graphNormalizeEntity(e){
    return e.trim().replace(/[-\s\`\[\]]+/g, '_').replace(/(^_)|(_$)/g, "");
}

function nullify(n){
    return n.toLowerCase().trim()=="null" ? '' : n;
}

class AraPermissionRelation {
    constructor(app, role, grantee, manager){
        
        this.type =  "...>";
        this.app = app;
        this.grantee = nullify(grantee);
        this.permissions = [ {'role':role, 'manager':nullify(manager)} ];

    }
    merge(otherArapermissionRelation){
        this.permissions = this.permissions.concat(otherArapermissionRelation.permissions)
    }
    id(){
        return `${this.grantee}${this.type}${this.app}`;
    }
    toString(){
        let description = this.permissions.map(perm => { 
            if(perm.manager)
                return `**${graphNormalizeEntity(this.app)}.${perm.role}** (mgt by ${graphNormalizeEntity(perm.manager)})` 
        })
        if(!this.grantee){
            //draw relationship from mgt -> app.role?
            return;
        }
        return `${graphNormalizeEntity(this.grantee)} ${this.type} ${graphNormalizeEntity(this.app)}: ${description.join('\\n')}`;
        //Voting ...> Agent: **AGENT.EXECUTE** (mgt by Voting)\n**AGENT.RUN_SCRIPT** (mgt by Voting)
    }
}

class AraApp {
    constructor(ref, type, options){
        this.ref = ref || type;
        this.type = type;

        delete options.ref
        delete options.type

        this.options = options;

        this.template = `
class %%ref%% {
    {abstract}%%type%%

    %%note%%
}
        `;
    }
    setTemplate(t){
        this.template = t;
    }
    toString(){
        return this.template
            .replace("%%ref%%", graphNormalizeEntity(this.ref))
            .replace("%%type%%", graphNormalizeEntity(this.type))
            .replace("%%note%%", Object.entries(this.options).map(([k,v]) => `\t**${k}** ${v}`).join('\n'));
    }
}

class AraToken {
    constructor(ref, options){
        this.ref = ref;
        
        delete options.ref;

        this.options = options;
        
        if(!this.template){
            this.template = `
package %%ref%% {
    class MiniMeToken
    note right
    %%note%%
    end note
}`;
        }
    }
    toString(){
        return this.template
            .replace("%%ref%%", graphNormalizeEntity(this.ref))
            .replace("%%note%%", Object.entries(this.options).map(([k,v]) => `\t**${k}** ${v}`).join('\n'));
    }
}

class AraGraph {
    constructor(config){
        this.apps = {};
        this.tokens = {};
        this.permissionTuples = {};

        this.config = config;
    }

    addPermission(p){
        p.grantee.split(',').forEach(grantee => {
            let newRel = new AraPermissionRelation(p.app, p.role, grantee, p.manager);
            let existingRel = this.permissionTuples[newRel.id()];
            if(existingRel){
                existingRel.merge(newRel);
            } else {
                this.permissionTuples[newRel.id()] = newRel;
            }
        })
        
    }

    addApp(a){
        let app = new AraApp(a.ref, a.type, a);
        this.apps[app.ref] = app; 
        let template = this.config.plantuml.applicationTemplates[app.type ? graphNormalizeEntity(app.type.toLowerCase()) : "__default__"];
        if(template)
            app.setTemplate(template)
    }

    addToken(t){
        let token = new AraToken(t.ref, t);
        this.tokens[token.ref] = token; 
    }

    uml(name, optionTxt){
        let uml = [];
        
        uml.push(`@startuml ${name || ""}`);
        uml.push(`' -- options --\n${optionTxt}`);

        uml.push(`' -- tokens --`);
        for(let t of Object.values(this.tokens)){
            uml.push(t.toString())
        }

        uml.push(`' -- apps --`);
        for(let a of Object.values(this.apps)){
            uml.push(a.toString())
            if(a.type==="token-manager" && a.options.token){
                uml.push(`${graphNormalizeEntity(a.ref)} <|-- ${graphNormalizeEntity(a.options.token)}`)
            }
        }
        
        uml.push(`' -- permissions --`);
        for(let p of Object.values(this.permissionTuples)){
            uml.push(p.toString())
        }
        
        uml.push("\n@enduml")
        return uml.join('\n');
    }
}

class AragonPermissions {
    constructor(config){
        this.filename = null;
        this.contents = null;

        this.data = null;

        let config_default = {
            plantuml : {
                header: ["allowmixing", "skinparam handwritten true"],
                applicationTemplates: {
                    _actor_: "actor %%ref%%",
                    __default__: "class %%ref%% {\n    {abstract}%%type%%\n    ----\n    %%note%%\n}"
                }
            }
        }
        
        this.config = {...config_default, ...config};
    }

    fromYaml(contents){
        if (fs.existsSync(contents)){
            this.filename = contents;
            contents = fs.readFileSync(contents, 'utf8');
        }
        this.data = YAML.parse(contents)
        return this;
    }

    async fromDAO(daoAddress, chainId) {
        const remoteDao = new dao.RemoteDao(daoAddress, chainId)

        await remoteDao.load()

        const permissions = remoteDao.getPermissions()
        const apps = remoteDao.getApps()

        this.data = {permissions: permissions, tokens: [], apps: apps, actions: []}
        return this;
    }

    fromMarkdownTable(contents){
        if (fs.existsSync(contents)){
            this.filename = contents;
            contents = fs.readFileSync(contents, 'utf8');
        }

        function zipObject(keys, values){
            let result = {};
            let i = 0;
            for(let key of keys){
                result[key] = values[i++]
            }
            return result;
        }
    
        let lines = [];
        let lineNr = 0;
    
        let tableData = [];
        let header = null;
    
        for(let line of contents.split('\n')){

            line = line.trim();
    
            if (!line.startsWith('|')){
                header = null;
                continue;
            }
    
            let lineData = line.split('|').filter(column => column.trim()).map(column => column.trim());
            if(!header && lineData && lineData[0].startsWith('--')){
                //header
                header = lines[lineNr-1].map(v => v.toLowerCase()).map(v => v=="permission"?"role":v);

                continue;
            }

            lines.push(lineData);
            lineNr++;
            if(header){
                tableData.push(zipObject(header, lineData.map(v => graphNormalizeEntity(v))))
            }
        }
        
        this.data = {'permissions':tableData, 'tokens':[], 'apps':[], 'actions':[]};
        return this;
    }

    uml(){

        let g = new AraGraph(this.config);

        for(let a of this.data.apps){
            g.addApp(a)
        }

        for(let t of this.data.tokens){
            g.addToken(t)
        }

        // -- process permissions
        for(let p of this.data.permissions){
            g.addPermission(p)
        }

        // -- process actions
        for(let p of this.data.actions){
            //g.addPermission(p)
        }
        
        // -- generate graph 

        return g.uml(this.data.id, this.config.plantuml.header.join('\n'));
    }
}

module.exports = {
    AragonPermissions:AragonPermissions
}