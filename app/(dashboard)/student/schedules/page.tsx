// app/student/schedules/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, CheckCircle, XCircle } from 'lucide-react';

interface Schedule {
  _id: string;
  grade: string;
  day: string;
  startTime: string;
  endTime: string;
  maxStudents: number;
  currentStudents: number;
  isActive: boolean;
}

interface Registration {
  _id: string;
  schedule: Schedule;
  status: string;
}

export default function StudentSchedulesPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [availableSchedules, setAvailableSchedules] = useState<Schedule[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableSchedules();
    fetchMyRegistrations();
  }, []);

  const fetchAvailableSchedules = async () => {
    try {
      const response = await fetch('/api/student/schedules/available', {
        credentials: 'include'
      });
      const data = await response.json();
      setAvailableSchedules(data.data.schedules || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      const response = await fetch('/api/student/schedules/my-schedule', {
        credentials: 'include'
      });
      const data = await response.json();
      setMyRegistrations(data.data.registrations || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setLoading(false);
    }
  };

  const registerForSchedule = async (scheduleId: string) => {
    try {
      const response = await fetch(`/api/student/schedules/${scheduleId}/register`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        fetchAvailableSchedules();
        fetchMyRegistrations();
      }
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  const cancelRegistration = async (scheduleId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء التسجيل؟')) return;

    try {
      const response = await fetch(`/api/student/schedules/${scheduleId}/cancel`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchAvailableSchedules();
        fetchMyRegistrations();
      }
    } catch (error) {
      console.error('Error cancelling registration:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">حصص اللغة العربية</h1>
        <p className="text-gray-600">سجل في حصص اللغة العربية المتاحة لصفك</p>
      </div>

      <Tabs defaultValue="available">
        <TabsList>
          <TabsTrigger value="available">الحصص المتاحة</TabsTrigger>
          <TabsTrigger value="my-schedule">حصصي المسجلة</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableSchedules.map((schedule) => (
              <Card key={schedule._id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>حصة لغة عربية</span>
                    <Badge variant={
                      schedule.currentStudents >= schedule.maxStudents ? "destructive" : "default"
                    }>
                      {schedule.currentStudents}/{schedule.maxStudents}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    حصة لغة عربية لطلاب {schedule.grade}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{schedule.day}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{schedule.startTime} - {schedule.endTime}</span>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => registerForSchedule(schedule._id)}
                    disabled={schedule.currentStudents >= schedule.maxStudents}
                  >
                    {schedule.currentStudents >= schedule.maxStudents ? 'ممتلئ' : 'سجل في الحصة'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-schedule">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myRegistrations.map((registration) => (
              <Card key={registration._id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>حصة لغة عربية</span>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 ml-1" />
                      مسجل
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    حصة لغة عربية - {registration.schedule.grade}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{registration.schedule.day}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{registration.schedule.startTime} - {registration.schedule.endTime}</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => cancelRegistration(registration.schedule._id)}
                  >
                    <XCircle className="h-4 w-4 ml-2" />
                    إلغاء التسجيل
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}