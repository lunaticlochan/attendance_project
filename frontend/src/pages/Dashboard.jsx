import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Calendar from '../components/calender/Calender';
import dummyData from '../components/dummydata/dummydata';
import axios from 'axios';
import { useSession } from '../contexts/SessionContext';
import { Container, Box, AppBar, Tabs, Tab, Paper, Grid, Typography } from '@mui/material';

const calculateMidAvg = (mid1, mid2) => {
  const [highest, lowest] = [mid1, mid2].sort((a, b) => b - a);
  return Math.ceil((highest * 2/3) + (lowest * 1/3));
};

const calculateTotal = (midAvg, assignAvg = 0, quiz = 0, attendance = 0) => {
  return Math.ceil(parseFloat(midAvg) + parseFloat(assignAvg) + quiz + attendance);
};

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const Dashboard = () => {
  const { session } = useSession();
  const [studentData, setStudentData] = useState(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/profile/details', {
          headers: {
            Authorization: `Bearer ${session.token}`
          }
        });
        setStudentData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch student data:', error);
      }
    };
    console.log(session);

    if (session?.token) {
      fetchStudentData();
    }
  }, [session]);

  const formatAttendanceForCalendar = (attendance) => {
    const formattedAttendance = {};
    
    attendance?.forEach(entry => {
      if (!formattedAttendance[entry.date]) {
        formattedAttendance[entry.date] = [];
      }
      formattedAttendance[entry.date].push({
        period: entry.period,
        present: entry.present,
        subject: entry.subject.name
      });
    });

    return formattedAttendance;
  };

  const formatEventsForCalendar = (events) => {
    const holidays = [];
    const exams = [];
    const activities = [];

    events?.forEach(event => {
      switch(event.type) {
        case 'holiday':
          holidays.push({ date: event.date, title: event.title });
          break;
        case 'exam':
          exams.push({ date: event.date, title: event.title });
          break;
        case 'activity':
          activities.push({ date: event.date, title: event.title });
          break;
        default:
          break;
      }
    });

    return {
      holidays,
      weeklyHolidays: ['Sunday'],
      exams,
      activities
    };
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 to-primary-900">
      <Container 
        maxWidth={false}
        sx={{ 
          pt: 12, 
          pb: 4,
          px: { xs: 2, sm: 3, md: 4 },
          maxWidth: '1300px !important',
          mx: 'auto',
        }}
      >
        {/* Student Info Card - Updated styling */}
        <Paper
          elevation={3}
          sx={{
            p: 2.5,
            mb: 3,
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Grid 
              container 
              spacing={2}
              alignItems="center"
            >
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" className="text-gray-400 text-sm">
                  Student Name
                </Typography>
                <Typography variant="h5" className="text-white font-semibold">
                  {studentData?.student?.name || 'Loading...'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" className="text-gray-400 text-sm">
                  Roll Number
                </Typography>
                <Typography variant="body1" className="text-white font-semibold">
                  {studentData?.student?.rollNo || 'Loading...'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" className="text-gray-400 text-sm">
                  Class
                </Typography>
                <Typography variant="body1" className="text-white font-semibold">
                  {studentData?.student?.class || 'Loading...'}
                </Typography>
              </Grid>
            </Grid>
          </motion.div>
        </Paper>

        {/* Existing Tabs and Content */}
        <Box sx={{ width: '100%' }}>
          <AppBar 
            position="static" 
            sx={{ 
              borderRadius: 1, 
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              width: '100%',
            }}
          >
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-selected': {
                    color: 'white',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                },
              }}
            >
              <Tab label="Attendance Calendar" />
              <Tab label="Academic Performance" />
              <Tab label="Teacher Remarks" />
            </Tabs>
          </AppBar>

          {/* Calendar Tab */}
          <TabPanel value={value} index={0}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mt: 3, 
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Calendar 
                attendance={formatAttendanceForCalendar(studentData?.attendance)}
                events={formatEventsForCalendar(studentData?.events)}
                studentId={studentData?.student?.rollNo}
              />
            </Paper>
          </TabPanel>

          {/* Academic Performance Tab */}
          <TabPanel value={value} index={1}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mt: 3, 
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold text-primary-100 mb-4">Academic Performance</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-secondary-700">
                    <thead className="bg-secondary-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Mid 1 (20)</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Mid 2 (20)</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Assignment 1 (10)</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Assignment 2 (10)</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quiz (5)</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attendance (5)</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-700">
                      {studentData?.marks?.map((subject, index) => {
                        const mid1 = subject.marks.mid1 ? parseFloat(subject.marks.mid1) : 0;
                        const mid2 = subject.marks.mid2 ? parseFloat(subject.marks.mid2) : 0;
                        const assignment1 = subject.marks.assignment1 ? parseFloat(subject.marks.assignment1) : 0;
                        const assignment2 = subject.marks.assignment2 ? parseFloat(subject.marks.assignment2) : 0;
                        const quiz = subject.marks.quiz ? parseFloat(subject.marks.quiz) : 0;
                        const attendance = subject.marks.attendance ? parseFloat(subject.marks.attendance) : 0;

                        const midAvg = (mid1 || mid2) ? 
                          (mid1 && mid2 ? calculateMidAvg(mid1, mid2) : (mid1 || mid2)) : 
                          0;

                        const calculatedTotal = calculateTotal(midAvg, assignment1, assignment2, quiz, attendance);

                        return (
                          <tr key={subject.subjectId} className={index % 2 === 0 ? 'bg-secondary-800/50' : 'bg-secondary-700/50'}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                              {subject.subjectName}
                            </td>
                            <td className="px-4 py-4 text-center text-sm text-gray-500">
                              {subject.marks.mid1 || '-'}
                            </td>
                            <td className="px-4 py-4 text-center text-sm text-gray-500">
                              {subject.marks.mid2 || '-'}
                            </td>
                            <td className="px-4 py-4 text-center text-sm text-gray-500">
                              {subject.marks.assignment1 || '-'}
                            </td>
                            <td className="px-4 py-4 text-center text-sm text-gray-500">
                              {subject.marks.assignment2 || '-'}
                            </td>
                            <td className="px-4 py-4 text-center text-sm text-gray-500">
                              {quiz || '-'}
                            </td>
                            <td className="px-4 py-4 text-center text-sm text-gray-500">
                              {attendance || '-'}
                            </td>
                            <td className="px-4 py-4 text-center text-sm font-medium text-green-600 font-bold">
                              {calculatedTotal}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </Paper>
          </TabPanel>

          {/* Teacher Remarks Tab */}
          <TabPanel value={value} index={2}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mt: 3, 
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold text-primary-100 mb-4">Teacher Remarks</h2>
                <div className="space-y-4">
                  {dummyData.remarks.map((remark, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="border-l-4 border-primary-500 pl-4 py-2"
                    >
                      <p className="text-secondary-300">{remark.comment}</p>
                      <div className="mt-2 flex justify-between text-sm text-secondary-400">
                        <span>{remark.teacher}</span>
                        <span>{remark.date}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </Paper>
          </TabPanel>
        </Box>
      </Container>
    </div>
  );
};

export default Dashboard;