import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Search, Star, Clock, DollarSign, CheckCircle, Calendar } from 'lucide-react';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { toast } from 'sonner';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: number;
  available: boolean;
  nextSlot?: string;
  price: number;
  languages: string[];
  verified: boolean;
}

const FindDoctor = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching doctors from:', API_ENDPOINTS.DOCTOR.LIST);
      const response = await apiClient.get<{ doctors: Doctor[] }>(API_ENDPOINTS.DOCTOR.LIST);
      console.log('Doctors response:', response);
      setDoctors(response.doctors || []);
    } catch (error: unknown) {
      console.error('Failed to load doctors:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách bác sĩ';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique specialties from doctors list
  const specialties = Array.from(new Set(doctors.map(d => d.specialty))).filter(Boolean).sort();

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleBookAppointment = (doctorId: number) => {
    navigate(`/user/book-appointment/${doctorId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading doctors...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-red-500 font-medium">An error occurred: {error}</div>
        <Button onClick={loadDoctors}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Find a Doctor</h1>
        <p className="text-muted-foreground mt-1">
          Connect with top mental health experts
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by doctor name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Select Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Found {filteredDoctors.length} doctors
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {doctor.name}
                    {doctor.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {doctor.specialty}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{doctor.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({doctor.reviews} reviews)
                </span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{doctor.experience} years experience</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>{formatPrice(doctor.price)}/session</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {doctor.languages.map((lang, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>

              {doctor.available && doctor.nextSlot && (
                <div className="flex items-center gap-2 pt-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    {doctor.nextSlot}
                  </span>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={doctor.available ? 'default' : 'outline'}
                disabled={!doctor.available}
                onClick={() => handleBookAppointment(doctor.id)}
              >
                {doctor.available ? 'Book Now' : 'Unavailable'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No doctors found matching your criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FindDoctor;
