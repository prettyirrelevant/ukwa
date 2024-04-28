export interface Bank {
  name: string;
  slug: string;
  code: string;
}

export interface TransferResponse {
  data: {
    reference: string;
  };
  status: boolean;
  message: string;
}

export interface TransferRecipientResponse {
  data: {
    details: {
      authorization_code?: string;
      account_number: string;
      account_name: string;
      bank_code: string;
      bank_name: string;
    };
    recipient_code: string;
    integration: number;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
    currency: string;
    active: boolean;
    domain: string;
    name: string;
    type: string;
    id: number;
  };
  status: boolean;
  message: string;
}

export interface AccountVerificationResponse {
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
  status: boolean;
  message: string;
}

export interface DepositWebhookPayload {
  data: {
    authorization: {
      authorization_code: string;
      country_code: string;
      account_name: string;
      reusable: boolean;
      card_type: string;
      exp_month: string;
      signature: string;
      exp_year: string;
      channel: string;
      brand: string;
      last4: string;
      bank: string;
      bin: string;
    };
    customer: {
      international_format_phone?: string;
      customer_code: string;
      risk_action: string;
      first_name: string;
      last_name: string;
      metadata: object;
      email: string;
      phone: string;
      id: number;
    };
    metadata: {
      custom_fields: {
        variable_name: string;
        display_name: string;
        value: string;
      }[];
      referrer: string;
    };
    source: {
      entry_point: string;
      identifier: null;
      source: string;
      type: string;
    };
    pos_transaction_data: null;
    gateway_response: string;
    requested_amount: number;
    fees_breakdown: null;
    created_at: string;
    ip_address: string;
    subaccount: object;
    reference: string;
    currency: string;
    fees_split: null;
    channel: string;
    paid_at: string;
    amount: number;
    domain: string;
    paidAt: string;
    status: string;
    order_id: null;
    message: null;
    split: object;
    fees: number;
    plan: object;
    id: number;
    log: null;
  };
  event: 'charge.success';
}
