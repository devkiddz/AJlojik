export type TransactionalEmailCategory =
  | 'email_verification'
  | 'password_reset'
  | 'delivery_update'
  | 'order_update';

export type SendTransactionalEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  category: TransactionalEmailCategory;
  idempotencyKey?: string;
};

export type SendTransactionalEmailResult = {
  id: string;
};
