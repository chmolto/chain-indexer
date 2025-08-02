import { useEffect, useState } from 'react';
import { TransferEvent } from '@chain-indexer/shared-interfaces';

export function App() {
  const [transfers, setTransfers] = useState<TransferEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transfers')
      .then((res) => res.json())
      .then((data) => {
        setTransfers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch transfers:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 border-b border-gray-200 pb-4 mb-6">
          Historial de Transferencias (ERC-20)
        </h1>

        {loading ? (
          <p className="text-gray-500 text-center py-8">
            Cargando datos desde el backend...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Desde (From)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hacia (To)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor (wei)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hash de Transacción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transfers.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-100 transition-colors duration-150"
                  >
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700"
                      title={tx.from}
                    >{`${tx.from.substring(0, 8)}...${tx.from.substring(
                      tx.from.length - 6
                    )}`}</td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700"
                      title={tx.to}
                    >{`${tx.to.substring(0, 8)}...${tx.to.substring(
                      tx.to.length - 6
                    )}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                      {tx.value}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600"
                      title={tx.transactionHash}
                    >{`${tx.transactionHash.substring(
                      0,
                      8
                    )}...${tx.transactionHash.substring(
                      tx.transactionHash.length - 6
                    )}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
