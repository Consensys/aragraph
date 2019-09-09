# aragon-dao-templates-graph

Generate permission relationship graphs from aragon template description files (`yaml`) or permissions specified with Markdown Tables.

### from DAO description files (yaml)

https://github.com/aragon/dao-templates/tree/master/descriptor

Example: https://github.com/aragon/dao-templates/blob/cc1eb1174a13c6d5ed0fcc1bbcc9d21bf9137a84/descriptor/examples/company.yaml

![image](https://user-images.githubusercontent.com/2865694/64525950-5a4e7f80-d302-11e9-875e-162affd6379c.png)


```

const araPerm = new AragonPermissions({'filename':'./examples/company.yaml'})
console.log(araPerm.uml())

```

### from markdown table

![image](https://user-images.githubusercontent.com/2865694/64525883-2bd0a480-d302-11e9-9054-07f92cf5fda6.png)


```
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

```