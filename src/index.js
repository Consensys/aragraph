/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
  * */


/** imports */
const YAML = require('yaml');
const fs = require('fs');

const ARAAPPS = {
    xvoting: "",
}

function graphNormalizeEntity(e){
    return e.replace(/[-\s]+/g, '_');
}

class AraPermissionRelation {
    constructor(app, role, grantee, manager){
        
        this.type =  "...>";
        this.app = app;
        this.grantee = grantee;
        this.permissions = [ {'role':role, 'manager':manager} ];

    }
    merge(otherArapermissionRelation){
        this.permissions = this.permissions.concat(otherArapermissionRelation.permissions)
    }
    id(){
        return `${this.grantee}${this.type}${this.app}`;
    }
    toString(){
        let description = this.permissions.map(perm => { return `**${graphNormalizeEntity(this.app)}.${perm.role}** (mgt by ${graphNormalizeEntity(perm.manager)})` })
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
        this.template = ARAAPPS[this.type];
        if(!this.template){
            this.template = `
class %%ref%% {
    {abstract}${this.type}

    %%note%%
}
`;
        }
    }
    toString(){
        return this.template
            .replace("%%ref%%", graphNormalizeEntity(this.ref))
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
        console.log(Object.entries(this.options))
        return this.template
            .replace("%%ref%%", graphNormalizeEntity(this.ref))
            .replace("%%note%%", Object.entries(this.options).map(([k,v]) => `\t**${k}** ${v}`).join('\n'));
    }
}

class AraGraph {
    constructor(){
        this.apps = {};
        this.tokens = {};
        this.permissionTuples = {};
    }

    addPermission(p){
        let newRel = new AraPermissionRelation(p.app, p.role, p.grantee, p.manager);
        let existingRel = this.permissionTuples[newRel.id()];
        if(existingRel){
            existingRel.merge(newRel);
        } else {
            this.permissionTuples[newRel.id()] = newRel;
        }
    }

    addApp(a){
        let app = new AraApp(a.ref, a.type, a);
        this.apps[app.ref] = app; 
    }

    addToken(t){
        let token = new AraToken(t.ref, t);
        this.tokens[token.ref] = token; 
    }

    uml(name, optionTxt){
        let uml = [];
        
        uml.push(`@startuml ${name}`);
        uml.push(`' -- options --\n ${optionTxt}`);

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
    constructor(input){
        this.filename = input['filename'];
        this.yaml = input['yaml'];
        this.data = input['data'] || (this.yaml && YAML.parse(this.yaml)) || (input['markdown'] && this._fromMarkdownTable(input['markdown']));

        console.log(this.data)

        if(this.filename && !this.data){
            this.data = YAML.parse(fs.readFileSync(this.filename, 'utf8'))
        }
        
    }

    _fromMarkdownTable(input){

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
    
        for(let line of input.split('\n')){
            
            line = line.trim();
    
            if (!line.startsWith('|')){
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

        
        return {'permissions':tableData, 'tokens':[], 'apps':[], 'actions':[]};
    }

    uml(){

        let g = new AraGraph();

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
        let optionTxt = `allowmixing
skinparam handwritten true
skinparam actor {
    BorderColor black
    FontName Courier
    BackgroundColor Gold
}`

        return g.uml(this.data.id, optionTxt);
    }
}

const araPerm = new AragonPermissions({'filename':'./examples/company.yaml'})
console.log(araPerm.uml())


const input = `
dfdf

| App               | Permission            | Grantee       | Manager |
|-------------------|-----------------------|---------------|---------|
| Kernel            | APP_MANAGER           | Voting        | Voting  |
| ACL               | CREATE_PERMISSIONS    | Voting        | Voting  |
| EVMScriptRegistry | REGISTRY_MANAGER      | Voting        | Voting  |
| EVMScriptRegistry | REGISTRY_ADD_EXECUTOR | Voting        | Voting  |
| Voting            | CREATE_VOTES          | Token Manager | Voting  |
| Voting            | MODIFY_QUORUM         | Voting        | Voting  |
| Voting            | MODIFY_SUPPORT        | Voting        | Voting  |
| Agent or Vault    | TRANSFER              | Finance       | Voting  |
| Finance           | CREATE_PAYMENTS       | Voting        | Voting  |
| Finance           | EXECUTE_PAYMENTS      | Voting        | Voting  |
| Finance           | MANAGE_PAYMENTS       | Voting        | Voting  |
| Token Manager     | MINT                  | Voting        | Voting  |
| Token Manager     | BURN                  | Voting        | Voting  |
`;




const araPerm2 = new AragonPermissions({'markdown':input})
console.log(araPerm2.uml())

