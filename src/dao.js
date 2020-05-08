/** 
 * @author github.com/tintinweb
 * @license MIT
 *
 * */
'use strict';

const Web3 = require('web3');
const Aragon = require('@aragon/wrapper').default;
const RxOp = require('rxjs/operators');

const ETH_PROVIDERS = {
    1: 'wss://mainnet.eth.aragon.network/ws',
    4: 'wss://rinkeby.eth.aragon.network/ws',
};
const ENS_REGISTRIES = {
    1: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    4: '0x98df287b6c145399aaa709692c8d308357bc085d',
};
const IPFS_GATEWAY_URL = 'https://ipfs.eth.aragon.network/ipfs';

class RemoteDao {

    constructor(daoAddress, chainId){
        this.daoAddress = daoAddress;
        this.chainId = chainId || 1;
    }

    async load(){
        const dao = new Aragon(this.daoAddress, {
            provider: new Web3.providers.WebsocketProvider(ETH_PROVIDERS[this.chainId]),
            apm: {
                ipfs: {
                    gateway: IPFS_GATEWAY_URL,
                },
                ensRegistryAddress: ENS_REGISTRIES[this.chainId],
            },
        });
        // Temporarily replace console.info
        // to hide 'Redefining LocalForage driver: memoryStorageDriver' message
        const consoleInfo = console.info;
        console.info = () => {};
        await dao.init();
        console.info = consoleInfo;

        this.apps = await dao.apps
            .pipe(RxOp.takeWhile((apps) => apps.length <= 1, true))
            .toPromise();
        this.permissions = await dao.permissions
            .pipe(RxOp.takeWhile((permissions) => permissions.length <= 1, true))
            .toPromise();
        return this;
    }

    getApps(){
        let apps = this.apps.map((app) => { 
            return {ref: `${app.name} ${app.proxyAddress.toLowerCase().substring(0, 6)}`, type: app.name};
        });
        let appNamesRefs = apps.map(app => app.ref);

        for(let p of this.getPermissions()){
            if(appNamesRefs.indexOf(p.app) < 0){
                apps.push({ref: p.app, type: '__actor__'});
                appNamesRefs.push(p.app);
            }
            if(appNamesRefs.indexOf(p.grantee) < 0){
                apps.push({ref: p.grantee, type: '__actor__'});
                appNamesRefs.push(p.grantee);
            }
            if(appNamesRefs.indexOf(p.manager) < 0){
                apps.push({ref: p.manager, type: '__actor__'});
                appNamesRefs.push(p.manager);
            }
        }
        return apps;
    }

    getPermissions(){
        // Get apps
        const apps = this.apps;
        const getAppName = (address) => {
            const app = apps.find((app) => {
                return address.toLowerCase() === app.proxyAddress.toLowerCase();
            });
            const name = app ? app.name : 'Unknown';
            return `${name} ${address.toLowerCase().substring(0, 6)}`;
        };

        // Get roles
        const allRoles = {};
        apps.forEach((app) => {
            app.roles.forEach((role) => {
                allRoles[role.bytes] = role.id;
            });
        });

        // Get permissions
        const permissions = this.permissions;

        const output = [];
        for (const [app, roles] of Object.entries(permissions)) {
            for (const [roleHash, data] of Object.entries(roles)) {
                const roleId = allRoles[roleHash] || 'Unknown';
                data.allowedEntities.forEach((entity) => {
                    output.push({
                        app: getAppName(app),
                        role: roleId,
                        grantee: getAppName(entity),
                        manager: getAppName(data.manager),
                    });
                });
            }
        }
        return output;
    }

    
}

module.exports.RemoteDao = RemoteDao;