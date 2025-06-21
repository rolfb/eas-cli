import EasCommand from '../../commandUtils/EasCommand';
import { EasJsonOnlyFlag } from '../../commandUtils/flags';
import { WorkflowRunQuery } from '../../graphql/queries/WorkflowRunQuery';
import Log from '../../log';
import formatFields from '../../utils/formatFields';
import { enableJsonOutput, printJsonOnlyOutput } from '../../utils/json';

export default class WorkflowView extends EasCommand {
  static override description = 'view details for a workflow run, including jobs';

  static override flags = {
    ...EasJsonOnlyFlag,
  };

  static override args = [{ name: 'id', description: 'ID of the workflow run to view' }];

  static override contextDefinition = {
    ...this.ContextOptions.ProjectId,
    ...this.ContextOptions.LoggedIn,
  };

  async runAsync(): Promise<void> {
    const { args, flags } = await this.parse(WorkflowView);
    const {
      loggedIn: { graphqlClient },
    } = await this.getContextAsync(WorkflowView, {
      nonInteractive: true,
    });
    if (flags.json) {
      enableJsonOutput();
    }

    const workflowId = args.id;
    if (!workflowId) {
      throw new Error('Must supply workflow run ID as argument');
    }

    const result = await WorkflowRunQuery.withJobsByIdAsync(graphqlClient, workflowId, {
      useCache: false,
    });

    if (flags.json) {
      printJsonOnlyOutput(result);
      return;
    }

    Log.log(
      formatFields([
        { label: 'Run ID', value: result.id },
        { label: 'Workflow', value: result.workflow.fileName },
        {
          label: 'Git Commit Message',
          value: result.gitCommitMessage?.split('\n')[0] ?? null ?? 'null',
        },
        { label: 'Git Commit Hash', value: result.gitCommitHash ?? 'null' },
        { label: 'Requested Git Ref', value: result.requestedGitRef ?? 'null' },
        { label: 'Status', value: result.status },
        { label: 'Errors', value: result.errors.map(error => error.title).join('\n') },
      ])
    );
    Log.addNewLineIfNone();
    result.jobs.forEach(job => {
      Log.log(
        formatFields([
          { label: 'Job ID', value: job.id },
          { label: '  Key', value: job.key },
          { label: '  Name', value: job.name },
          { label: '  Status', value: job.status },
          { label: '  Type', value: job.type },
          { label: '  Created At', value: job.createdAt },
          { label: '  Updated At', value: job.updatedAt },
          { label: '  Outputs', value: JSON.stringify(job.outputs, null, 2) },
          { label: '  Errors', value: job.errors.map(error => error.title).join('\n') },
        ])
      );
      Log.addNewLineIfNone();
    });
  }
}
