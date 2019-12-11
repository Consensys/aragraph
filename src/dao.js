const Web3 = require('web3')
const Aragon = require('@aragon/wrapper').default
const RxOp = require('rxjs/operators')

const ETH_PROVIDERS = {
    1: 'wss://mainnet.eth.aragon.network/ws',
    4: 'wss://rinkeby.eth.aragon.network/ws',
}
const ENS_REGISTRIES = {
    1: '0x314159265dd8dbb310642f98f50c066173c1259b',
    4: '0x98df287b6c145399aaa709692c8d308357bc085d',
}
const IPFS_GATEWAY_URL = 'https://ipfs.eth.aragon.network/ipfs'

async function getPermissions(daoAddress, chainId) {
    const dao = new Aragon(daoAddress, {
        provider: new Web3.providers.WebsocketProvider(ETH_PROVIDERS[chainId]),
        apm: {
            ipfs: {
                gateway: IPFS_GATEWAY_URL,
            },
            ensRegistryAddress: ENS_REGISTRIES[chainId],
        },
    })
    // Temporarily replace console.info
    // to hide 'Redefining LocalForage driver: memoryStorageDriver' message
    const consoleInfo = console.info
    console.info = () => {}
    await dao.init()
    console.info = consoleInfo

    // Get apps
    const apps = await dao.apps
        .pipe(RxOp.takeWhile((apps) => apps.length <= 1, true))
        .toPromise()
    const getAppName = (address) => {
        const app = apps.find((app) => {
            return address.toLowerCase() === app.proxyAddress
        })
        const name = app ? app.name : 'Unknown'
        return `${name} ${address.toLowerCase().substring(0, 6)}`
    }

    // Get roles
    const allRoles = {}
    apps.forEach((app) => {
        app.roles.forEach((role) => {
            allRoles[role.bytes] = role.id
        })
    })

    // Get permissions
    const permissions = await dao.permissions
        .pipe(RxOp.takeWhile((permissions) => permissions.length <= 1, true))
        .toPromise()

    const output = []
    for (const [app, roles] of Object.entries(permissions)) {
        for (const [roleHash, data] of Object.entries(roles)) {
            const roleId = allRoles[roleHash] || 'Unknown'
            data.allowedEntities.forEach((entity) => {
                output.push({
                    app: getAppName(app),
                    role: roleId,
                    grantee: getAppName(entity),
                    manager: getAppName(data.manager),
                })
            })
        }
    }
    return output
}

module.exports.getPermissions = getPermissions