import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [toEmail, setToEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) router.push("/login");
    else {
      fetchBalance();
      fetchTransactions();
    }
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await axios.get(${process.env.NEXT_PUBLIC_API_URL}/balance, {
        headers: { Authorization: token },
      });
      setBalance(res.data.balance);
    } catch {
      toast.error("Failed to fetch balance");
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(${process.env.NEXT_PUBLIC_API_URL}/transactions, {
        headers: { Authorization: token },
      });
      setTransactions(res.data);
    } catch {
      toast.error("Failed to fetch transactions");
    }
  };

  const handleTransfer = async () => {
    try {
      await axios.post(
        ${process.env.NEXT_PUBLIC_API_URL}/transfer,
        { toEmail, amount: Number(amount) },
        { headers: { Authorization: token } }
      );
      toast.success("Transfer successful!");
      setToEmail("");
      setAmount("");
      fetchBalance();
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.error || "Transfer failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
      </div>
      <div className="mb-5">Balance: <span className="font-bold">${balance}</span></div>
      <div className="bg-white p-5 rounded shadow-md mb-5">
        <h2 className="font-bold mb-3">Send Money</h2>
        <input
          type="email"
          placeholder="Receiver Email"
          value={toEmail}
          onChange={e => setToEmail(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <button onClick={handleTransfer} className="bg-green-500 text-white p-2 w-full rounded">
          Send
        </button>
      </div>
      <div className="bg-white p-5 rounded shadow-md">
        <h2 className="font-bold mb-3">Transactions</h2>
        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <ul>
            {transactions.map((tx, idx) => (
              <li key={idx} className="border-b py-2">
                {tx.date.split("T")[0]}: {tx.from} → {tx.to} : ${tx.amount}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
