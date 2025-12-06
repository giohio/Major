import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Search, Filter, Users, Plus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { toast } from 'sonner';

interface Patient {
  id: number;
  name: string;
  age: number;
  condition: string;
  lastSession: string;
}

interface SearchUser {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
}

const PatientList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Patient Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ patients: Record<string, unknown>[] }>(API_ENDPOINTS.DOCTOR.PATIENTS);

      const mappedPatients: Patient[] = response.patients.map((p: Record<string, unknown>) => ({
        id: Number(p.id),
        name: String(p.full_name),
        age: p.date_of_birth ? new Date().getFullYear() - new Date(String(p.date_of_birth)).getFullYear() : 0,
        condition: (p.record && typeof p.record === 'object' && 'diagnosis' in p.record ? String(p.record.diagnosis) : null) || 'No diagnosis',
        lastSession: p.last_activity ? String(p.last_activity) : new Date().toISOString()
      }));

      setPatients(mappedPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!userSearchQuery || userSearchQuery.length < 3) return;

    try {
      setIsSearching(true);
      const response = await apiClient.get<{ users: SearchUser[] }>(
        `${API_ENDPOINTS.DOCTOR.SEARCH_USERS}?query=${encodeURIComponent(userSearchQuery)}`
      );
      setSearchResults(response.users);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddPatient = async (userId: number) => {
    try {
      setIsAdding(true);
      await apiClient.post(API_ENDPOINTS.DOCTOR.ADD_PATIENT, { patient_id: userId });
      toast.success('Patient added successfully');
      setIsAddModalOpen(false);
      fetchPatients(); // Refresh list
      setSearchResults([]);
      setUserSearchQuery('');
    } catch (error: unknown) {
      console.error('Add patient failed:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String(error.response.data.error) : 'Failed to add patient';
      toast.error(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchQuery.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchLower) ||
      patient.condition.toLowerCase().includes(searchLower)
    );
  });

  const totalPatients = patients.length;

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading patients...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Patient List</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track patient progress
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">Under care</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>My Patients</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, condition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Patient
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Last Session</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {patient.age} years old
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{patient.condition}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(patient.lastSession).toLocaleDateString('en-US')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No patients found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Patient Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter email or phone..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
              />
              <Button onClick={handleSearchUsers} disabled={isSearching}>
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{user.full_name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddPatient(user.id)}
                      disabled={isAdding}
                    >
                      {isAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </Button>
                  </div>
                ))
              ) : userSearchQuery && !isSearching ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No users found
                </div>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientList;
