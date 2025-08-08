# Projeto Scraper de Produtos da Amazon

Um scraper moderno para extrair informações de produtos da Amazon com interface web responsiva.

## Tecnologias

- **Backend**: Bun + Express + Axios + JSDOM
- **Frontend**: Vite + HTML/CSS/JS puro

## Funcionalidades

- 🔍 Busca de produtos na Amazon por palavra-chave
- ⭐ Extração de título, avaliação, número de reviews e URL do produto
- 🖼️ Exibição de imagens dos produtos
- 🔗 Links diretos para os produtos na Amazon
- 📱 Interface web responsiva e moderna
- ⚡ Tratamento de erros e estados de carregamento
- 🚀 Performance otimizada com Bun

## Como rodar

### Pré-requisitos

- Bun (versão 1.0 ou superior)
- Node.js (para o frontend)

### 1. Backend

```bash
cd backend
npm install
bun run dev
```

O servidor estará rodando em `http://localhost:3000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## API Endpoints

### GET /api/scrape

Busca produtos na Amazon por palavra-chave.

**Parâmetros:**
- `keyword` (string, obrigatório): Palavra-chave para busca

**Exemplo de teste:**
```bash
curl "http://localhost:3000/api/scrape?keyword=mouse"
```

**Resposta:**
```json
{
  "products": [
    {
      "title": "Nome do Produto",
      "rating": 4.5,
      "reviewCount": 1234,
      "imageUrl": "https://...",
      "productUrl": "https://www.amazon.com/dp/..."
    }
  ],
  "count": 20
}
```

## Instalação do Bun

Para instalar o Bun no Windows via PowerShell:

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

## Estrutura do Projeto

```
amazon-scraper/
├── backend/
│   ├── server.js          # Servidor principal com lógica de scraping
│   ├── package.json       # Dependências e scripts do backend
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── main.js        # Lógica principal do frontend
│   │   └── style.css      # Estilos da aplicação
│   ├── index.html         # Página principal
│   ├── package.json       # Dependências e scripts do frontend
│   └── package-lock.json
└── README.md
```

## Observações

- O scraper utiliza técnicas avançadas de extração para contornar as limitações da Amazon
- Os resultados podem variar dependendo da disponibilidade dos produtos
- Recomenda-se usar termos de busca específicos para melhores resultados
