# Configuração do Stripe - Pal Creator Premium

## 📋 Pré-requisitos

1. Conta no Stripe (https://stripe.com)
2. Chaves de API do Stripe

## 🔑 Configuração das Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Como obter as chaves:

1. **STRIPE_SECRET_KEY**: Dashboard Stripe → Developers → API keys → Secret key
2. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**: Dashboard Stripe → Developers → API keys → Publishable key
3. **STRIPE_WEBHOOK_SECRET**: Criar webhook primeiro (veja abaixo)

## 🔔 Configuração do Webhook

1. Acesse o Dashboard do Stripe → Developers → Webhooks
2. Clique em "Add endpoint"
3. URL do endpoint: `https://seudominio.com/api/webhooks/stripe`
   - Para desenvolvimento local, use: `https://seu-tunnel.ngrok.io/api/webhooks/stripe` (com ngrok)
4. Selecione os eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copie o "Signing secret" e adicione como `STRIPE_WEBHOOK_SECRET`

## 📁 Estrutura de Dados no Firebase

Os dados de assinatura são armazenados em:
```
users/{uid}/subscription/
  - status: "active" | "canceled" | "past_due" | "expired" | null
  - stripeCustomerId: string
  - stripeSubscriptionId: string
  - currentPeriodEnd: timestamp
  - currentPeriodStart: timestamp
  - plan: "monthly"
  - isPremium: boolean
  - cancelAtPeriodEnd: boolean
```

## 🚀 Como Usar

### Verificar Status Premium em uma Página

```typescript
import { usePremium } from '@/hooks/usePremium';

export default function MyPage() {
  const { isPremium, loading } = usePremium();

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      {isPremium ? (
        <div>Conteúdo Premium</div>
      ) : (
        <div>Conteúdo Gratuito</div>
      )}
    </div>
  );
}
```

### Proteger Componentes com PremiumGuard

```typescript
import PremiumGuard from '@/components/PremiumGuard';

export default function PremiumFeature() {
  return (
    <PremiumGuard>
      <div>Este conteúdo só aparece para usuários Premium</div>
    </PremiumGuard>
  );
}
```

### Redirecionar para Checkout

```typescript
import { redirectToCheckout } from '@/lib/premium';

function SubscribeButton() {
  return (
    <button onClick={redirectToCheckout}>
      Assinar Premium
    </button>
  );
}
```

### Cancelar Assinatura

```typescript
import { cancelSubscription } from '@/lib/premium';

async function handleCancel() {
  const success = await cancelSubscription();
  if (success) {
    alert('Assinatura cancelada com sucesso');
  }
}
```

## 🧪 Testando em Modo de Desenvolvimento

Use os cartões de teste do Stripe:
- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **Requer autenticação**: `4000 0025 0000 3155`

Qualquer data futura para validade e qualquer CVC funcionam.

## 📝 Notas Importantes

- O webhook precisa ser configurado para sincronizar o status da assinatura
- Para desenvolvimento local, use ngrok ou similar para expor o webhook
- O preço padrão é R$ 29,90/mês (2990 centavos)
- A assinatura é cancelada no final do período atual (não imediatamente)

