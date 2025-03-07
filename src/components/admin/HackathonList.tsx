import React, { useEffect, useState } from 'react';
import Button from '../common/Button';
import api from '../../services/api';

interface Hackathon {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  participantCount: number;
}

export const HackathonList: React.FC = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/hackathons');
      setHackathons(response.data as Hackathon[]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch hackathons');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Hackathons</h2>
        <Button text="Create New Hackathon" onClick={() => { /* handle click */ }} />
      </div>
      
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Start Date</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">End Date</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Participants</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {hackathons.map((hackathon) => (
            <tr key={hackathon.id} className="border-b">
              <td className="px-6 py-4">{hackathon.name}</td>
              <td className="px-6 py-4">{new Date(hackathon.startDate).toLocaleDateString()}</td>
              <td className="px-6 py-4">{new Date(hackathon.endDate).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <span className={`capitalize px-2 py-1 rounded text-sm ${getStatusColor(hackathon.status)}`}>
                  {hackathon.status}
                </span>
              </td>
              <td className="px-6 py-4">{hackathon.participantCount}</td>
              <td className="px-6 py-4">
                <Button text="Edit" className="mr-2" onClick={() => { /* handle edit */ }} />
                <Button text="Delete" variant="danger" onClick={() => { /* handle delete */ }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'upcoming': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default HackathonList;