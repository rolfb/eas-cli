import gql from 'graphql-tag';

export const WorkflowRunFragmentNode = gql`
  fragment WorkflowRunFragment on WorkflowRun {
    id
    status
    gitCommitMessage
    gitCommitHash
    requestedGitRef
    createdAt
    updatedAt
    workflow {
      id
      name
      fileName
    }
  }
`;
