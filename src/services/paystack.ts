import { AccountVerificationResponse, TransferRecipientResponse, TransferResponse, Bank } from './interface';
export { type DepositWebhookPayload } from './interface';

export class Paystack {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(
    path: string,
    method: 'POST' | 'GET' = 'GET',
    body?: Record<string, unknown>,
    params?: Record<string, string>,
  ): Promise<T> {
    try {
      let url = `${this.baseUrl}${path}`;
      if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
      }

      const headers = {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      };

      const options: RequestInit = {
        headers,
        method,
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error('[Paystack] Error making request:', error);
      throw error;
    }
  }

  async createTransferRecipient(
    accountName: string,
    accountNumber: string,
    bankCode: string,
  ): Promise<TransferRecipientResponse['data']> {
    const body = {
      account_number: accountNumber,
      bank_code: bankCode,
      name: accountName,
      currency: 'NGN',
      type: 'nuban',
    };
    const response = await this.makeRequest<TransferRecipientResponse>('/transferrecipient', 'POST', body);
    return response.data;
  }

  async transfer(amount: string, transferRecipientId: string, txReference: string): Promise<TransferResponse['data']> {
    const body = {
      reason: `Withdraw ${amount} from wrapped naira`,
      recipient: transferRecipientId,
      reference: txReference,
      source: 'balance',
      amount,
    };
    const response = await this.makeRequest<TransferResponse>('/transfer', 'POST', body);
    return response.data;
  }

  async verifyAccountNumber(bankCode: string, accountNumber: string): Promise<AccountVerificationResponse['data']> {
    const params = {
      account_number: accountNumber,
      bank_code: bankCode,
    };
    const response = await this.makeRequest<AccountVerificationResponse>('/bank/resolve', 'GET', undefined, params);
    return response.data;
  }

  async getBanks(): Promise<Record<string, Bank>> {
    const response = await this.makeRequest<{ data: Record<string, Bank> }>('/bank');
    return response.data;
  }
}
