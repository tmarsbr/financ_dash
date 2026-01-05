# Exemplos Práticos de Prompts para o Gemini

## Introdução

Este documento contém exemplos reais de prompts que serão enviados para a API do Gemini, junto com as respostas esperadas. Esses exemplos cobrem os principais casos de uso do dashboard financeiro.

---

## Exemplo 1: Análise de Gastos por Categoria

### Dados de Entrada

```json
{
  "accounts": [
    { "id": "acc-001", "name": "Nubank Corrente", "balance": 2500.00, "type": "corrente" }
  ],
  "transactions": [
    { "id": "tx-001", "date": "2026-01-05", "description": "iFood", "amount": 55.90, "category": "Alimentação", "accountId": "acc-001" },
    { "id": "tx-002", "date": "2026-01-08", "description": "Mercado X", "amount": 150.00, "category": "Alimentação", "accountId": "acc-001" },
    { "id": "tx-003", "date": "2026-01-10", "description": "Uber", "amount": 25.00, "category": "Transporte", "accountId": "acc-001" },
    { "id": "tx-004", "date": "2026-01-12", "description": "Cinema", "amount": 60.00, "category": "Lazer", "accountId": "acc-001" },
    { "id": "tx-005", "date": "2026-01-15", "description": "Netflix", "amount": 29.90, "category": "Lazer", "accountId": "acc-001" }
  ],
  "goals": [],
  "user_question": "Qual foi minha maior categoria de gasto em janeiro?"
}
```

### Prompt Montado

```
# CONTEXTO
Você é um Assistente Financeiro Pessoal Especialista. Sua missão é analisar os dados financeiros do usuário para fornecer respostas claras, insights úteis e recomendações práticas. Responda sempre em Markdown.

# DADOS FINANCEIROS

## CONTAS
[
  { "id": "acc-001", "name": "Nubank Corrente", "balance": 2500.00, "type": "corrente" }
]

## TRANSAÇÕES
[
  { "id": "tx-001", "date": "2026-01-05", "description": "iFood", "amount": 55.90, "category": "Alimentação", "accountId": "acc-001" },
  { "id": "tx-002", "date": "2026-01-08", "description": "Mercado X", "amount": 150.00, "category": "Alimentação", "accountId": "acc-001" },
  { "id": "tx-003", "date": "2026-01-10", "description": "Uber", "amount": 25.00, "category": "Transporte", "accountId": "acc-001" },
  { "id": "tx-004", "date": "2026-01-12", "description": "Cinema", "amount": 60.00, "category": "Lazer", "accountId": "acc-001" },
  { "id": "tx-005", "date": "2026-01-15", "description": "Netflix", "amount": 29.90, "category": "Lazer", "accountId": "acc-001" }
]

## METAS
[]

# PERGUNTA DO USUÁRIO
"Qual foi minha maior categoria de gasto em janeiro?"

# SUA ANÁLISE
```

### Resposta Esperada do Gemini

```markdown
Sua maior categoria de gasto em janeiro foi **Alimentação** com um total de **R$ 205,90**.

Aqui está o resumo de todos os seus gastos por categoria:

| Categoria | Total | % do Total |
|-----------|-------|-----------|
| Alimentação | R$ 205,90 | 58,4% |
| Lazer | R$ 89,90 | 25,5% |
| Transporte | R$ 25,00 | 7,1% |
| **TOTAL** | **R$ 320,80** | **100%** |

**Insight:** Você gastou mais da metade de seu orçamento com alimentação. Se você está buscando economizar, essa pode ser uma área onde há oportunidade de redução!
```

---

## Exemplo 2: Identificação de Gastos Atípicos

### Dados de Entrada

```json
{
  "accounts": [
    { "id": "acc-001", "name": "Nubank Corrente", "balance": 3500.00, "type": "corrente" }
  ],
  "transactions": [
    { "id": "tx-001", "date": "2026-01-05", "description": "iFood", "amount": 55.90, "category": "Alimentação", "accountId": "acc-001" },
    { "id": "tx-002", "date": "2026-01-08", "description": "Mercado X", "amount": 150.00, "category": "Alimentação", "accountId": "acc-001" },
    { "id": "tx-003", "date": "2026-01-10", "description": "Uber", "amount": 25.00, "category": "Transporte", "accountId": "acc-001" },
    { "id": "tx-004", "date": "2026-01-15", "description": "Passagem Aérea SP-RJ", "amount": 850.00, "category": "Viagem", "accountId": "acc-001" },
    { "id": "tx-005", "date": "2026-01-20", "description": "Hotel Rio de Janeiro", "amount": 1200.00, "category": "Viagem", "accountId": "acc-001" }
  ],
  "goals": [],
  "user_question": "Identifique gastos atípicos no meu histórico."
}
```

### Resposta Esperada do Gemini

```markdown
Identifiquei **2 gastos atípicos** em seu histórico:

### 🚨 Gastos Atípicos Detectados

1.  **Passagem Aérea SP-RJ** - R$ 850,00 (15/01/2026)
    *   Valor muito acima da sua média diária (R$ 45,00)
    *   Categoria: Viagem
    *   Este é um gasto ocasional, provavelmente uma viagem planejada

2.  **Hotel Rio de Janeiro** - R$ 1.200,00 (20/01/2026)
    *   Valor significativamente alto
    *   Categoria: Viagem
    *   Também relacionado à sua viagem para o Rio

### Análise

Esses dois gastos juntos somam **R$ 2.050,00**, representando 86% de seus gastos totais em janeiro. Isso indica que você fez uma viagem importante no mês. Se essa foi uma viagem planejada, tudo bem! Mas se foi impulsiva, pode ser uma oportunidade para planejar melhor viagens futuras.
```

---

## Exemplo 3: Progresso em Direção a uma Meta

### Dados de Entrada

```json
{
  "accounts": [
    { "id": "acc-001", "name": "Nubank Corrente", "balance": 5500.00, "type": "corrente" }
  ],
  "transactions": [
    { "id": "tx-001", "date": "2025-11-01", "description": "Depósito Meta", "amount": 2000.00, "category": "Renda", "accountId": "acc-001" },
    { "id": "tx-002", "date": "2025-12-01", "description": "Depósito Meta", "amount": 1500.00, "category": "Renda", "accountId": "acc-001" },
    { "id": "tx-003", "date": "2026-01-01", "description": "Depósito Meta", "amount": 2000.00, "category": "Renda", "accountId": "acc-001" }
  ],
  "goals": [
    { "id": "goal-001", "name": "Viagem para a Europa", "targetAmount": 20000.00, "currentAmount": 5500.00, "targetDate": "2026-12-31" }
  ],
  "user_question": "Como está meu progresso em relação à minha meta de viagem para a Europa?"
}
```

### Resposta Esperada do Gemini

```markdown
Ótimas notícias! Você está fazendo um **excelente progresso** em relação à sua meta de viagem para a Europa! 🎉

### Resumo da Meta

| Métrica | Valor |
|---------|-------|
| **Meta Total** | R$ 20.000,00 |
| **Valor Atual** | R$ 5.500,00 |
| **Progresso** | 27,5% |
| **Falta** | R$ 14.500,00 |
| **Prazo** | 31 de dezembro de 2026 (11 meses) |

### Análise de Economia

Analisando seus depósitos, você tem economizado uma média de **R$ 1.833,33 por mês** para essa meta. Se você manter esse ritmo:

*   **Valor acumulado em 11 meses:** R$ 20.166,63
*   **Status:** Você **atingirá sua meta com folga**! 🎊

### Recomendação

Continue com seu plano atual! Você está no caminho certo. Se quiser acelerar ainda mais, tente aumentar seus depósitos em apenas R$ 100-200 por mês para ter uma margem extra para gastos durante a viagem.
```

---

## Exemplo 4: Comparação de Períodos

### Dados de Entrada

```json
{
  "accounts": [
    { "id": "acc-001", "name": "Nubank Corrente", "balance": 4200.00, "type": "corrente" }
  ],
  "transactions": [
    { "id": "tx-001", "date": "2025-12-05", "description": "iFood", "amount": 45.00, "category": "Alimentação", "accountId": "acc-001" },
    { "id": "tx-002", "date": "2025-12-10", "description": "Mercado", "amount": 200.00, "category": "Alimentação", "accountId": "acc-001" },
    { "id": "tx-003", "date": "2025-12-15", "description": "Restaurante", "amount": 120.00, "category": "Alimentação", "accountId": "acc-001" },
    { "id": "tx-004", "date": "2026-01-05", "description": "iFood", "amount": 55.90, "category": "Alimentação", "accountId": "acc-001" },
    { "id": "tx-005", "date": "2026-01-08", "description": "Mercado X", "amount": 150.00, "category": "Alimentação", "accountId": "acc-001" }
  ],
  "goals": [],
  "user_question": "Como foram meus gastos com alimentação em dezembro comparado a janeiro?"
}
```

### Resposta Esperada do Gemini

```markdown
Aqui está a comparação de seus gastos com **Alimentação** entre dezembro e janeiro:

### Comparação Mensal

| Mês | Total | Número de Transações | Ticket Médio |
|-----|-------|----------------------|--------------|
| **Dezembro/2025** | R$ 365,00 | 3 | R$ 121,67 |
| **Janeiro/2026** | R$ 205,90 | 2 | R$ 102,95 |
| **Diferença** | -R$ 159,10 (-43,6%) | -1 | -R$ 18,72 |

### Análise

Você **reduziu seus gastos com alimentação em 43,6%** em janeiro comparado a dezembro! Isso é um ótimo sinal.

**Possíveis razões:**
*   Você fez menos compras no supermercado em janeiro
*   Reduziu gastos com delivery e restaurantes
*   Melhor planejamento das refeições

**Dica:** Mantenha esse ritmo! Se você conseguir manter essa economia de R$ 159 por mês, pode adicionar esse valor à sua meta de viagem para a Europa.
```

---

## Exemplo 5: Análise Completa e Insights Proativos

### Dados de Entrada

```json
{
  "accounts": [
    { "id": "acc-001", "name": "Nubank Corrente", "balance": 3250.00, "type": "corrente" },
    { "id": "acc-002", "name": "Itaú Poupança", "balance": 15000.00, "type": "poupanca" }
  ],
  "transactions": [
    { "id": "tx-001", "date": "2026-01-05", "description": "Salário", "amount": 5000.00, "category": "Renda", "accountId": "acc-001" },
    { "id": "tx-002", "date": "2026-01-05", "description": "iFood", "amount": 55.90, "category": "Alimentação", "accountId": "acc-001" },
    { "id": "tx-003", "date": "2026-01-08", "description": "Mercado X", "amount": 150.00, "category": "Alimentação", "accountId": "acc-001" },
    { "id": "tx-004", "date": "2026-01-10", "description": "Uber", "amount": 25.00, "category": "Transporte", "accountId": "acc-001" },
    { "id": "tx-005", "date": "2026-01-12", "description": "Aluguel", "amount": 1500.00, "category": "Moradia", "accountId": "acc-001" },
    { "id": "tx-006", "date": "2026-01-15", "description": "Netflix", "amount": 29.90, "category": "Lazer", "accountId": "acc-001" },
    { "id": "tx-007", "date": "2026-01-20", "description": "Transferência para Poupança", "amount": 1000.00, "category": "Investimento", "accountId": "acc-001" }
  ],
  "goals": [
    { "id": "goal-001", "name": "Viagem para a Europa", "targetAmount": 20000.00, "currentAmount": 5500.00, "targetDate": "2026-12-31" }
  ],
  "user_question": "Faça uma análise completa do meu mês e me dê insights e recomendações."
}
```

### Resposta Esperada do Gemini

```markdown
# Análise Completa de Suas Finanças - Janeiro de 2026

## 📊 Resumo Geral

| Métrica | Valor |
|---------|-------|
| **Receitas Totais** | R$ 5.000,00 |
| **Despesas Totais** | R$ 1.760,80 |
| **Investimentos** | R$ 1.000,00 |
| **Saldo Líquido** | **R$ 2.239,20** |

**Status:** ✅ Você teve um mês **muito positivo**! Parabéns!

---

## 💰 Distribuição de Despesas

| Categoria | Valor | % |
|-----------|-------|---|
| Moradia | R$ 1.500,00 | 85,2% |
| Alimentação | R$ 205,90 | 11,7% |
| Transporte | R$ 25,00 | 1,4% |
| Lazer | R$ 29,90 | 1,7% |
| **Total** | **R$ 1.760,80** | **100%** |

---

## 🎯 Principais Insights

### 1. Saúde Financeira Excelente
Você conseguiu economizar **R$ 2.239,20** em um mês, o que representa **44,8% da sua renda**. Isso é excelente e coloca você bem acima da média brasileira!

### 2. Moradia é Sua Principal Despesa
Seu aluguel (R$ 1.500,00) representa 85,2% de suas despesas. Isso é normal, mas fique atento para garantir que essa proporção não aumente.

### 3. Gastos com Alimentação Controlados
Seus gastos com alimentação (R$ 205,90) estão bem controlados. Se você conseguir manter ou reduzir isso, terá mais espaço para investimentos.

### 4. Investimento Consistente
Você transferiu R$ 1.000,00 para sua poupança, demonstrando disciplina e planejamento. Continue assim!

---

## 🚀 Recomendações

1.  **Acelere Sua Meta de Viagem:** Com a economia atual, você pode aumentar seus depósitos para a Europa em R$ 200-300 por mês sem afetar seu estilo de vida. Isso aceleraria sua meta em 2-3 meses.

2.  **Monitore Gastos Pequenos:** Seus gastos com delivery (iFood) e transporte (Uber) são pequenos, mas tenha cuidado para que não cresçam. Uma redução de 20% aqui economizaria R$ 16/mês.

3.  **Considere Investimentos Adicionais:** Além da poupança, considere explorar outras opções de investimento (CDB, Tesouro Direto) para fazer seu dinheiro render mais.

4.  **Mantenha o Ritmo:** Seu padrão de gastos é muito saudável. Continue com essa disciplina!

---

## 📈 Projeção para os Próximos 12 Meses

Se você manter esse ritmo de economia:

*   **Economia Total Esperada:** R$ 26.870,40
*   **Saldo em Poupança (Dez/2026):** R$ 41.870,40
*   **Meta de Viagem (Dez/2026):** Atingida com **R$ 21.870,40** (ultrapassando a meta em R$ 1.870,40)

**Conclusão:** Você está no caminho certo para uma vida financeira saudável! 🎉
```

---

## Exemplo 6: Pergunta Ambígua (Pedindo Esclarecimento)

### Dados de Entrada

```json
{
  "accounts": [
    { "id": "acc-001", "name": "Nubank Corrente", "balance": 3250.00, "type": "corrente" }
  ],
  "transactions": [...],
  "goals": [...],
  "user_question": "Como posso melhorar?"
}
```

### Resposta Esperada do Gemini

```markdown
Ótima pergunta! Para te dar a melhor resposta, preciso entender melhor o que você quer melhorar. Você está pensando em:

*   **Economizar mais a cada mês?** (Aumentar a quantidade de dinheiro que você guarda)
*   **Reduzir gastos em uma categoria específica?** (Ex: Alimentação, Transporte)
*   **Atingir uma meta financeira mais rápido?** (Ex: Sua viagem para a Europa)
*   **Aumentar sua renda?** (Ganhar mais dinheiro)
*   **Investir melhor seu dinheiro?** (Fazer seu dinheiro render mais)

Me diga qual é sua prioridade e farei uma análise detalhada com recomendações específicas para você!
```

---

## Conclusão

Esses exemplos cobrem os principais tipos de análises que o Gemini será capaz de fazer. O prompt deve ser flexível o suficiente para lidar com variações, mas estruturado o bastante para garantir respostas de qualidade.

**Dica para o desenvolvimento:** Teste cada um desses exemplos com a API real do Gemini para validar as respostas antes de integrar ao dashboard.
