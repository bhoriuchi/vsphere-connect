export default {
  description: `Perform a branching conditional equivalent to <code>if-then-else</code>
<br><br>The <code>branch</code> command takes 2n+1 arguments: pairs of conditional expressions and commands to be executed if the conditionals return any value but <code>false</code> or <code>null</code> (i.e., “truthy” values), with a final “else” command to be evaluated if all of the conditionals are <code>false</code> or <code>null</code>`,
  usage: [
    'v.branch(test, true_action[, test2, test2_action, ...], false_action) → any',
    'test.branch(true_action[, test2, test2_action, ...], false_action) → any'
  ],
  example: {
    description: 'Test that a string is equal',
    code: `let vmId = 'vm-10'
v.branch(v.expr(vmId).eq('vm-10'), 'equal', 'not-equal')
`
  }
}
