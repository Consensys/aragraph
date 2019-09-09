# aragon-dao-templates-graph

Generate permission relationship graphs from aragon template description files (`yaml`) or permissions specified with Markdown Tables.

### from yaml
```

const araPerm = new AragonPermissions({'filename':'./examples/company.yaml'})
console.log(araPerm.uml())

```

### from markdown table
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