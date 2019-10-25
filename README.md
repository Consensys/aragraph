[<img width="200" alt="get in touch with Consensys Diligence" src="https://user-images.githubusercontent.com/2865694/56826101-91dcf380-685b-11e9-937c-af49c2510aa0.png">](https://diligence.consensys.net)<br/>
<sup>
[[  🌐  ](https://diligence.consensys.net)  [  📩  ](mailto:diligence@consensys.net)  [  🔥  ](https://consensys.github.io/diligence/)]
</sup><br/><br/>

![aragraph](https://user-images.githubusercontent.com/2865694/67569431-25ba4a00-f72f-11e9-9573-82d3af805a54.png)


# aragraph

Generate permission relationship graphs from aragon template description files (`yaml`) or Markdown Tables specifications.

This script generates UML descriptions for aragon templates that can be rendered with [Plantuml](http://plantuml.com/).

**install** 

`$ npm install -g aragraph`

**generate from yaml description**

`$ aragraph ./examples/company.yaml > dao.plantuml `

**generate from markdown**

`$ aragraph ./examples/aragon_company_README.md > dao.plantuml `

**Render**

`$ java -jar plantuml.jar dao.plantuml`

## Library

### from DAO description files (yaml)

https://github.com/aragon/dao-templates/tree/master/descriptor

Example: https://github.com/aragon/dao-templates/blob/cc1eb1174a13c6d5ed0fcc1bbcc9d21bf9137a84/descriptor/examples/company.yaml

![image](https://user-images.githubusercontent.com/2865694/64525950-5a4e7f80-d302-11e9-875e-162affd6379c.png)


```
const AragonPermissions = require("./AragonPermissions.js");

console.log(new AragonPermissions().fromYaml('./examples/company.yaml').uml())

```

### from markdown table

Example: https://github.com/aragon/dao-templates/blob/master/templates/company/README.md

![image](https://user-images.githubusercontent.com/2865694/64526657-2a07e080-d304-11e9-82fa-0f81e7834326.png)


```
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



console.log(new AragonPermissions().fromMarkdownTable(md).uml())

```
