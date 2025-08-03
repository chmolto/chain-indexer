# Chain Indexer Service

Un sistema de indexación de eventos de blockchain que monitoriza, procesa y almacena las transferencias del token LINK en la red de prueba Sepolia. El proyecto cuenta con un backend robusto construido con NestJS, un frontend moderno con React, y utiliza PostgreSQL y Redis para la persistencia y el manejo de colas.

![Frontend Screenshot](https://img001.prntscr.com/file/img001/XodeOupzRvyoUkDvDsSbNA.png)

## 🎯 Demostrando las Competencias Clave del Puesto

Este proyecto fue construido específicamente para demostrar la experiencia y las habilidades requeridas para un rol de Desarrollador Backend enfocado en infraestructura blockchain. A continuación se detalla cómo cada componente del proyecto se alinea con los requisitos clave:

### **1. Consumo y Procesamiento de Eventos (En Vivo e Históricos)**

- **Evidencia:** El `BlockchainService` implementa dos métodos de consumo distintos:
  - **En Vivo:** `listenToTransfers()` utiliza un **WebSocket Provider** (`wss://`) para escuchar y procesar eventos `Transfer` en tiempo real.
  - **Histórico:** `startIndexingHistoricalEvents()` utiliza un **RPC Provider** (`https://`) para consultar y procesar eficientemente miles de eventos pasados en lotes (`queryFilter`).
- **Habilidad Demostrada:** Entiendo y he implementado las dos principales formas de ingesta de datos de la blockchain, seleccionando la herramienta adecuada (WebSocket/RPC) para cada caso de uso.

### **2. Construcción de Sistemas Confiables y Concurrentes**

- **Evidencia:** La arquitectura central se basa en un pipeline de datos robusto: `Listener -> Cola (BullMQ + Redis) -> Worker`.
  - Cuando se detecta un evento, no se procesa inmediatamente. En su lugar, se añade como un "trabajo" a una cola persistente en **Redis**.
  - Un `EventProcessor` (worker) separado y asíncrono consume estos trabajos de la cola para procesarlos y guardarlos en la base de datos.
- **Habilidad Demostrada:** He diseñado un sistema que **desacopla la ingesta del procesamiento**, garantizando que no se pierdan datos incluso si la base de datos o el procesador fallan temporalmente. La cola maneja la concurrencia y los picos de eventos, y los trabajos se reintentan automáticamente en caso de error, asegurando una alta fiabilidad.

### **3. Optimización de Rendimiento y Manejo de Límites de Tasa**

- **Evidencia:** Durante la indexación histórica, me enfrenté a los límites de tasa (`rate limits`) de la API del proveedor de nodos. Resolví este problema del mundo real mediante:
  - **Procesamiento por Lotes:** Reduciendo el número de bloques consultados en cada llamada (`blockChunk`).
  - **Pausas Estratégicas:** Introduciendo un `setTimeout` entre cada lote para no saturar la API.
  - **Caching Inteligente:** Implementé un caché en memoria (`Map`) para los `timestamps` de los bloques, reduciendo drásticamente las llamadas RPC de "una por evento" a "una por bloque".
- **Habilidad Demostrada:** Soy capaz de identificar cuellos de botella de rendimiento y aplicar soluciones prácticas y eficientes para trabajar de manera respetuosa y robusta con infraestructuras externas.

### **4. Modelado de Datos y Diseño de API**

- **Evidencia:**
  - Diseñé la entidad `TransferEventEntity` con **TypeORM**, eligiendo los tipos de datos correctos en **PostgreSQL** (ej. `numeric` para valores grandes, `timestamp` para fechas).
  - Creé una API RESTful con NestJS que expone un endpoint `GET /api/transfers` con **paginación** (`page`, `limit`).
- **Habilidad Demostrada:** Puedo modelar datos on-chain en un esquema relacional y exponerlos a través de APIs limpias, escalables y eficientes, listas para ser consumidas por un frontend.

## 🏗️ Arquitectura del Sistema

El flujo de datos sigue un patrón de procesamiento de eventos asíncrono y robusto para garantizar la fiabilidad y escalabilidad.

```mermaid
flowchart TD
    %% Cliente y API
    subgraph "Cliente"
        H[Frontend (React)]
    end

    subgraph "Backend (NestJS)"
        E[API Controller]
    end

    H -- "Petición HTTP" --> E

    %% Flujo de Ingesta y Procesamiento
    subgraph "Blockchain (Sepolia)"
        A[Contrato LINK]
    end

    subgraph "Backend (NestJS)"
        B[BlockchainService] -- "Añade Job" --> C((BullMQ Queue))
        D[EventProcessor]
    end

    subgraph "Infraestructura"
        F[(Redis)]
        G[(PostgreSQL)]
    end

    A -- "WebSocket: Evento 'Transfer'" --> B
    B -- "RPC: queryFilter" --> A

    C -- "Persistido en" --> F
    C -- "Consume Job" --> D

    D -- "Guarda Datos en" --> G
    E -- "Consulta Datos de" --> G
```

## 🚀 Features

- **Monitorización en Tiempo Real**: Escucha eventos `Transfer` del token LINK en la red Sepolia.
- **Indexación Histórica**: Indexa todos los eventos de transferencia desde la creación del contrato.
- **Dashboard Web**: Interfaz moderna con React para explorar y paginar los eventos.
- **Procesamiento Basado en Colas**: Utiliza **BullMQ** para un procesamiento de eventos fiable.
- **Almacenamiento en Base de Datos**: **PostgreSQL** con **TypeORM** para la persistencia de datos.
- **Arquitectura Monorepo**: Construido con **Nx** para un desarrollo eficiente y compartido.

## 📋 Prerrequisitos

- Node.js (v18 o superior)
- Docker y Docker Compose

## 🛠️ Instalación y Ejecución

Este proyecto está completamente containerizado para una configuración rápida y sencilla.

1.  **Clonar el repositorio**

    ```bash
    git clone <repository-url>
    cd chain-indexer-service
    ```

2.  **Configurar las variables de entorno**
    Crea un archivo `.env` en la raíz del proyecto a partir del ejemplo.

    ```bash
    cp .env.example .env
    ```

    Ahora, edita el archivo `.env` y añade tus URLs de proveedor de nodo (Alchemy, Infura, etc.) para la red Sepolia.

    ```env
    # Blockchain (Sepolia testnet)
    SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY
    SEPOLIA_WS_URL=wss://eth-sepolia.g.alchemy.com/v2/TU_API_KEY
    ```

3.  **Levantar los servicios con Docker Compose**
    Este comando creará y levantará los contenedores de PostgreSQL y Redis en segundo plano.

    ```bash
    docker-compose up -d
    ```

4.  **Instalar dependencias de Node.js**

    ```bash
    npm install
    ```

5.  **Iniciar la aplicación**
    Abre dos terminales separadas en la raíz del proyecto.

    _En la Terminal 1, inicia el backend:_

    ```bash
    nx serve backend
    ```

    _En la Terminal 2, inicia el frontend:_

    ```bash
    nx serve frontend
    ```

La aplicación estará disponible en:

- **Frontend**: `http://localhost:4200`
- **Backend API**: `http://localhost:3000/api`

La primera vez que se inicie el backend, comenzará el proceso de indexación histórica, lo cual puede tardar varios minutos. Podrás ver el progreso en los logs de la terminal del backend.

## 📊 API Endpoints

### GET `/api/transfers`

Recupera una lista paginada de los eventos de transferencia.

**Parámetros de Consulta:**

- `page` (opcional, número): El número de página a solicitar. Por defecto: `1`.
- `limit` (opcional, número): El número de resultados por página. Por defecto: `25`.

**Respuesta Exitosa (200 OK):**

````json
{
  "data": [
    {
      "transactionHash": "0x...",
      "fromAddress": "0x...",
      "toAddress": "0x...",
      "value": "1000000000000000000",
      "blockNumber": 1234567,
      "transactionDate": "2025-08-03T10:00:00.000Z"
    }
  ],
  "count": 15234
}```

## 🔧 Comandos de Desarrollo (Nx)

-   `nx build <app-name>`: Compila una aplicación para producción.
-   `nx test <app-name>`: Ejecuta las pruebas unitarias.
-   `nx lint <app-name>`: Analiza el código con el linter.
-   `nx reset`: Limpia la caché de Nx.

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
````
