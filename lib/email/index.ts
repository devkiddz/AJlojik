export { isAuthEmailEnabled } from './emailConfig';
export {
  buildEmailVerificationTemplate,
  buildPasswordResetTemplate
} from './emailTemplates';
export { queueTransactionalEmail } from './queueTransactionalEmail';
export { sendTransactionalEmail } from './sendTransactionalEmail';
export type {
  SendTransactionalEmailInput,
  SendTransactionalEmailResult,
  TransactionalEmailCategory
} from './emailTypes';
