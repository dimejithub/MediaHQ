import { useEffect, useState } from 'react';
import { Users, Search, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function TeamDirectory() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [editData, setEditData] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchMembers();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const filtered = members.filter(
      (m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, { credentials: 'include' });
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/team/members`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      setMembers(data);
      setFilteredMembers(data);
    } catch (error) {
      toast.error('Failed to load team members');
      console.error(error);
    }
  };

  const handleEditMember = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/team/members/${selectedMember.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editData)
      });
      if (!response.ok) throw new Error('Failed to update member');
      toast.success('Member updated successfully');
      setSelectedMember(null);
      setEditData({});
      fetchMembers();
    } catch (error) {
      toast.error('Failed to update member');
      console.error(error);
    }
  };

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'team_lead';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="team-directory-page">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-2">Team Directory</h1>
          <p className="text-base text-slate-600">Manage your media team members and their skills</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, email, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="team-search-input"
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.user_id} className="hover:shadow-lg transition-shadow" data-testid={`member-card-${member.user_id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={member.picture} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-heading font-semibold truncate">{member.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent capitalize">
                    {member.role}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {member.skills.length > 0 ? (
                    member.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No skills listed</span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  member.availability === 'available' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {member.availability === 'available' ? 'Available' : 'Unavailable'}
                </span>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedMember(member);
                      setEditData({
                        name: member.name,
                        role: member.role,
                        skills: member.skills,
                        availability: member.availability,
                        phone: member.phone || ''
                      });
                    }}
                    data-testid={`edit-member-${member.user_id}`}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No team members found</p>
        </div>
      )}

      {/* Edit Member Dialog */}
      {selectedMember && (
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent data-testid="edit-member-dialog">
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Role</Label>
                <Select
                  value={editData.role}
                  onValueChange={(value) => setEditData({ ...editData, role: value })}
                >
                  <SelectTrigger data-testid="role-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="team_lead">Team Lead</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Availability</Label>
                <Select
                  value={editData.availability}
                  onValueChange={(value) => setEditData({ ...editData, availability: value })}
                >
                  <SelectTrigger data-testid="availability-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  data-testid="phone-input"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label>Skills (comma-separated)</Label>
                <Input
                  value={editData.skills?.join(', ') || ''}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  data-testid="skills-input"
                  placeholder="e.g., Camera, Sound, Lighting"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setSelectedMember(null)} data-testid="cancel-edit-btn">
                  Cancel
                </Button>
                <Button onClick={handleEditMember} data-testid="save-member-btn">
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}