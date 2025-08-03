import { TransferEvent } from '@chain-indexer/shared-interfaces';
import { formatDistanceToNow } from 'date-fns';
import { formatUnits } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { FiCopy, FiExternalLink } from 'react-icons/fi';

interface PaginatedResponse {
  data: TransferEvent[];
  count: number;
}

const ITEMS_PER_PAGE = 25; // Etherscan usa 25 o 50

export function App() {
  const [transfers, setTransfers] = useState<TransferEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchTransfers = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/transfers?page=${page}&limit=${ITEMS_PER_PAGE}`
      );
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const data: PaginatedResponse = await response.json();
      setTransfers(data.data);
      setTotalCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error');
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransfers(currentPage);
  }, [currentPage, fetchTransfers]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Podrías añadir una notificación de "Copiado!" aquí
  };

  const shortenAddress = (addr: string) => `${addr.substring(0, 14)}...`;

  const renderPagination = () => (
    <div className="flex items-center justify-between mt-4 text-sm">
      <div className="text-gray-600">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage <= 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          First
        </button>
        <button
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          {'<'}
        </button>
        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          {'>'}
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Last
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="border-b pb-4 mb-4">
          <p className="text-gray-600">
            More than {totalCount.toLocaleString()} transactions found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-3 font-normal">Transaction Hash</th>
                <th className="py-3 font-normal">Method</th>
                <th className="py-3 font-normal">Block</th>
                <th className="py-3 font-normal">Age</th>
                <th className="py-3 font-normal">From</th>
                <th className="py-3 font-normal">To</th>
                <th className="py-3 font-normal text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-6">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))}

              {!loading &&
                transfers.map((tx) => (
                  <tr key={tx.transactionHash}>
                    <td className="py-4">
                      <a
                        href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {shortenAddress(tx.transactionHash)} <FiExternalLink />
                      </a>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 text-xs bg-gray-100 border rounded-md">
                        Transfer
                      </span>
                    </td>
                    <td className="py-4 text-blue-600">{tx.blockNumber}</td>
                    <td className="py-4 text-gray-600">
                      {tx.transactionDate &&
                        formatDistanceToNow(new Date(tx.transactionDate), {
                          addSuffix: true,
                        })}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">
                          {shortenAddress(tx.fromAddress)}
                        </span>
                        <button
                          onClick={() => handleCopy(tx.fromAddress)}
                          className="text-gray-500 hover:text-black"
                        >
                          <FiCopy />
                        </button>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">
                          {shortenAddress(tx.toAddress)}
                        </span>
                        <button
                          onClick={() => handleCopy(tx.toAddress)}
                          className="text-gray-500 hover:text-black"
                        >
                          <FiCopy />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      {parseFloat(formatUnits(tx.value, 18)).toFixed(4)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </div>
    </div>
  );
}

export default App;
