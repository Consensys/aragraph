[<img width="200" alt="get in touch with Consensys Diligence" src="https://user-images.githubusercontent.com/2865694/56826101-91dcf380-685b-11e9-937c-af49c2510aa0.png">](https://diligence.consensys.net)<br/>
<sup>
[[  🌐  ](https://diligence.consensys.net)  [  📩  ](mailto:diligence@consensys.net)  [  🔥  ](https://consensys.github.io/diligence/)]
</sup><br/><br/>

![aragraph-logo](https://user-images.githubusercontent.com/2865694/68420282-4dcc9300-019c-11ea-9ff1-849d91fb0bad.png)

# AraGraph

[This blog post](https://diligence.consensys.net/blog/2019/11/aragraph-dao-permissions-visualized/) is a good introduction to AraGraph.

AraGraph is a tool to generate nice looking permission graphs for Aragon DAOs. It can take the following inputs:

- The address and chain-ID of a live DAO.
- A DAO template description file (`yaml`).
- A specification in Markdown table format.

The tool generates an UML description for the DAO. Use [Plantuml](http://plantuml.com/) to render it.

![aragraph](https://user-images.githubusercontent.com/2865694/67569431-25ba4a00-f72f-11e9-9573-82d3af805a54.png)

**install** 

`$ npm install -g aragraph`

## CLI

**generate for a live DAO on mainnet**

`$ aragraph 0x2dE83b50Af29678774D5AbC4a7Cb2a588762f28C --chain-id 1 > dao.plantuml `

**generate from yaml description**

`$ aragraph ./examples/company.yaml > dao.plantuml `

**generate from markdown**

`$ aragraph ./examples/aragon_company_README.md > dao.plantuml `

**Render**

`$ java -jar plantuml.jar dao.plantuml`

or open with [vscode-PlantUML](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)

## Library

### for a live DAO on mainnet

[Example: DAO-Kernel on mainnet](https://etherscan.io/address/0x2dE83b50Af29678774D5AbC4a7Cb2a588762f28C#code)

![fromDAO](https://user-images.githubusercontent.com/2865694/70704084-9b737880-1cd1-11ea-8288-e01a356d756f.png)

```js
new AragonPermissions().fromDAO(address, chainId).then((aragaph) => {
        console.log(aragaph.uml())
        process.exit(0)
})
```

### from DAO description files (yaml)

[Specification: DAO-Templates/Descriptor](https://github.com/aragon/dao-templates/tree/master/descriptor)

[Example: Company.yaml](https://github.com/aragon/dao-templates/blob/cc1eb1174a13c6d5ed0fcc1bbcc9d21bf9137a84/descriptor/examples/company.yaml)

![fromYaml](https://user-images.githubusercontent.com/2865694/70704101-a3331d00-1cd1-11ea-98a5-908818107cbb.png)


```js
const AragonPermissions = require("./AragonPermissions.js");
console.log(new AragonPermissions().fromYaml('./examples/company.yaml').uml())
```

### from markdown table

[Example: Readme.md](https://github.com/aragon/dao-templates/blob/master/templates/company/README.md)

![image](https://user-images.githubusercontent.com/2865694/64526657-2a07e080-d304-11e9-82fa-0f81e7834326.png)


```js
const AragonPermissions = require("./AragonPermissions.js");
const input = `

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
| Agent             | RUN_SCRIPT            | Voting        | Voting  |
| Agent             | EXECUTE               | Voting        | Voting  |
| Finance             | CREATE_PAYMENTS            | Payroll             | Voting        |
| Payroll             | ADD_BONUS_ROLE             | EOA or Voting       | Voting        |
| Payroll             | ADD_EMPLOYEE_ROLE          | EOA or Voting       | Voting        |
| Payroll             | ADD_REIMBURSEMENT_ROLE     | EOA or Voting       | Voting        |
| Payroll             | TERMINATE_EMPLOYEE_ROLE    | EOA or Voting       | Voting        |
| Payroll             | SET_EMPLOYEE_SALARY_ROLE   | EOA or voting       | Voting        |
| Payroll             | MODIFY_PRICE_FEED_ROLE     | Voting              | Voting        |
| Payroll             | MODIFY_RATE_EXPIRY_ROLE    | Voting              | Voting        |
| Payroll             | MANAGE_ALLOWED_TOKENS_ROLE | Voting              | Voting        |
`;

console.log(new AragonPermissions().fromMarkdownTable(input).uml())
```

# Contributors 🤗

* [Kirill Goncharov](https://github.com/xuhcc) - [#1 (generate from mainnet)](https://github.com/ConsenSys/aragraph/pull/1)
