import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import * as pdfjs from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import { useSession } from '../contexts/SessionContext';
import { useNavigate } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Container,
  Box,
  AppBar,
  Tabs,
  Tab,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Slider,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

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
      {value === index && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box>{children}</Box>
        </motion.div>
      )}
    </div>
  );
}

const TeacherDashboard = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  const [students, setStudents] = useState([]);
  // const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Add session check effect
  useEffect(() => {
    if (!session?.token || session?.user?.role !== 'teacher') {
      navigate('/login');
      return;
    }
  }, [session, navigate]);

  // Form states
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    type: 'activity' // Default type
  });
  
  const [marksForm, setMarksForm] = useState({
    studentId: '',
    subjectName: '',
    examType: 'mid1',
    score: ''
  });

  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '',
    periods: [{
      period: 1,
      subjectId: '',
      present: true
    }]
  });

  // Add new state for PDF file
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Add exam types constant
  const EXAM_TYPES = {
    MID1: 'mid1',
    MID2: 'mid2',
    ASSIGNMENT1: 'assignment1',
    ASSIGNMENT2: 'assignment2',
    QUIZ: 'quiz',
    ATTENDANCE: 'attendance'
  };

  // Add these new states
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  // Update the initial state of similarityThreshold
  const [similarityThreshold, setSimilarityThreshold] = useState(0.6);

  // Add this to your state declarations
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const periods = [1, 2, 3, 4, 5, 6, 7, 8]; // Add all your periods

  // Move fetchStudents inside useEffect
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/students', {
          headers: {
            Authorization: `Bearer ${session.token}`
          }
        });
        console.log('Fetched students:', response.data.data); // Debug log
        setStudents(response.data.data);
      } catch (error) {
        console.error('Failed to fetch students:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    if (session?.token && session?.user?.role === 'teacher') {
      fetchStudents();
    }
  }, [session, navigate]);

  // const fetchSubjects = async () => {
  //   try {
  //     const response = await axios.get('http://localhost:3000/subjects');
  //     setSubjects(response.data.data);
  //   } catch (error) {
  //     console.error('Failed to fetch subjects:', error);
  //   }
  // };

  // Handler functions
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/events', eventForm, {
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        }
      });
      showNotification('Event added successfully!');
      setEventForm({ title: '', date: '', type: 'activity' });
    } catch (error) {
      console.error('Failed to add event:', error);
      showNotification('Failed to add event', 'error');
    } finally {
      setLoading(false);
    }
  };

  // const handleAddMarks = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem('token');
      
  //     // Create payload with score converted to number
  //     const payload = {
  //       ...marksForm,
  //       score: parseFloat(marksForm.score) // Convert score to number
  //     };

  //     await axios.post('http://localhost:3000/marks', payload, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });
      
  //     alert('Marks added successfully!');
  //     setMarksForm({ studentId: '', subjectName: '', examType: 'mid1', score: '' });
  //   } catch (error) {
  //     console.error('Failed to add marks:', error);
  //     alert('Failed to add marks');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleAddAttendance = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        studentId: attendanceForm.studentId,
        subjectName: session.user.subject,
        periods: attendanceForm.periods.map(period => ({
          period: period.period,
          present: period.present
        }))
      };

      await axios.post('http://localhost:3000/attendance', payload, {
        headers: { Authorization: `Bearer ${session.token}` }
      });

      alert('Attendance marked successfully!');
      setAttendanceForm({
        studentId: '',
        periods: [{ period: 1, present: true }]
      });
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      alert(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  // Add new function to handle PDF processing
  const handleMarksUpload = async (e) => {
    console.log("----------------------------------------------------")
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    try {
      const file = pdfFile;
      const subjectName = session.user.subject;

      if (!subjectName) {
        throw new Error('Teacher subject not found');
      }

      // Read the Excel file
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Log the raw worksheet data
            console.log("Raw worksheet:", worksheet);
            
            // Convert to JSON with header row
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
              header: 1,
              raw: true,
              defval: ''
            });
            
            console.log("JSON Data after conversion:", jsonData);
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsBinaryString(file);
      });

      // Skip header row and process data
      const studentMarks = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row && row.length >= 2) {
          const rollNo = row[0]?.toString().trim();
          const score = parseInt(row[1]);
          
          console.log("Processing row:", row);
          console.log("Roll No:", rollNo);
          console.log("Score:", score);

          if (rollNo && rollNo.startsWith('A211265510') && !isNaN(score)) {
            studentMarks.push({
              studentId: rollNo,
              subjectName: subjectName,
              examType: marksForm.examType,
              score: score
            });
          }
        }
      }

      console.log("Final processed marks:", studentMarks);

      if (studentMarks.length === 0) {
        throw new Error("No valid student marks were found in the Excel file. Please check the format: Column 1 should be 'Student roll number' and Column 2 should be 'marks'");
      }

      if (studentMarks.length !== 24) {
        throw new Error(`Expected 24 students but found ${studentMarks.length}. Please check the Excel format.`);
      }

      // Upload marks for each student
      let completed = 0;
      for (const studentMark of studentMarks) {
        const markPayload = {
          studentId: studentMark.studentId,
          subjectName: subjectName,
          examType: marksForm.examType,
          score: studentMark.score
        };

        console.log("Uploading mark:", markPayload);

        await axios.post('http://localhost:3000/marks', markPayload, {
          headers: {
            Authorization: `Bearer ${session.token}`,
            'Content-Type': 'application/json'
          }
        });
        completed++;
        setUploadProgress((completed / studentMarks.length) * 100);
      }

      alert('Marks uploaded successfully for all students!');
      setPdfFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Failed to process Excel file and upload marks:', error);
      alert(error.response?.data?.message || error.message || 'Failed to process Excel file and upload marks');
    } finally {
      setLoading(false);
    }
  };

  // Replace the existing Add Marks Form with this new version
  const renderMarksForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20"
    >
      <h2 className="text-2xl font-bold mb-4 text-white">Upload Marks (Excel)</h2>
      <form onSubmit={handleMarksUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200">Upload Marks Excel File</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setPdfFile(e.target.files[0])}
            className="mt-1 block w-full text-gray-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">Exam Type</label>
          <select
            value={marksForm.examType}
            onChange={(e) => setMarksForm({ ...marksForm, examType: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-700/50 text-white focus:border-blue-500 focus:ring-blue-500 shadow-sm"
            required
          >
            <option value={EXAM_TYPES.MID1}>Mid Term 1 (20)</option>
            <option value={EXAM_TYPES.MID2}>Mid Term 2 (20)</option>
            <option value={EXAM_TYPES.ASSIGNMENT1}>Assignment 1 (10)</option>
            <option value={EXAM_TYPES.ASSIGNMENT2}>Assignment 2 (10)</option>
            <option value={EXAM_TYPES.QUIZ}>Quiz (5)</option>
            <option value={EXAM_TYPES.ATTENDANCE}>Attendance (5)</option>
          </select>
        </div>
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !pdfFile}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors duration-200"
        >
          {loading ? 'Processing...' : 'Upload Marks'}
        </button>
      </form>
    </motion.div>
  );

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Add the new ImageAttendanceSection component
  const ImageAttendanceSection = () => {
    const [attendanceData, setAttendanceData] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [manualAttendance, setManualAttendance] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post(
          'http://localhost:8000/api/aggregation/test_image/',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${session.token}`,
            },
          }
        );

        setAttendanceData(response.data.data);
        // Initialize manual attendance with API results
        const initialAttendance = {};
        response.data.data.matches.forEach(match => {
          initialAttendance[match.student_id] = match.similarity >= similarityThreshold;
        });
        setManualAttendance(initialAttendance);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to process image');
      }
    };

    const handleConfirmAttendance = async () => {
      try {
        // Just log what would be sent to the API
        const attendancePayload = {
          period: selectedPeriod,
          studentId: Object.keys(manualAttendance)
            .filter(id => manualAttendance[id])
            .map(id => ({
              studentId: id,
              subjectName: session.user.subject,
              present: true
            }))
        };

        console.log('Attendance that would be marked:', attendancePayload);
        alert(`Attendance for Period ${selectedPeriod} marked successfully! (Simulated)`);
        setShowConfirmDialog(false);
        setAttendanceData(null);
        setSelectedImage(null);
      } catch (error) {
        console.error('Failed to mark attendance:', error);
        alert('Failed to mark attendance');
      }
    };

    // Update the processAttendanceData function
    const processAttendanceData = (matches, allStudents) => {
      const getStudentNumber = (studentId) => {
        // Extract number and pad with leading zero if needed
        const number = studentId.replace('student', '');
        return number.padStart(2, '0');
      };

      const processedAttendance = allStudents.map(student => {
        // Get the last two digits of the roll number
        const lastTwoDigits = student.rollNo.slice(-2);
        
        // Find if this student was detected in the matches
        const matchedStudent = matches.find(match => 
          getStudentNumber(match.student_id) === lastTwoDigits
        );

        // Only mark as present if similarity is above threshold
        const isPresent = matchedStudent && matchedStudent.similarity >= similarityThreshold;

        return {
          rollNo: student.rollNo,
          name: student.name,
          class: student.class,
          present: isPresent,
          similarity: matchedStudent ? matchedStudent.similarity : 0
        };
      });

      return processedAttendance;
    };

    return (
      <Box sx={{ p: 3 }}>
        {/* Manual Attendance Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Manual Attendance
          </Typography>
          <form onSubmit={handleAddAttendance}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="student-select-label">Select Student</InputLabel>
                  <Select
                    labelId="student-select-label"
                    value={attendanceForm.studentId}
                    label="Select Student"
                    onChange={(e) => setAttendanceForm({
                      ...attendanceForm,
                      studentId: e.target.value
                    })}
                  >
                    {students && students.map((student) => (
                      <MenuItem 
                        key={student.id} 
                        value={student.rollNo}
                      >
                        {student.rollNo} - {student.name} ({student.class})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="period-select-label">Select Period</InputLabel>
                  <Select
                    labelId="period-select-label"
                    value={selectedPeriod}
                    label="Select Period"
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    {periods.map((period) => (
                      <MenuItem key={period} value={period}>
                        Period {period}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Period Attendance
                  </Typography>
                  {attendanceForm.periods.map((period, index) => (
                    <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mr: 2, minWidth: '80px' }}>
                        Period {period.period}
                      </Typography>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={period.present}
                            onChange={(e) => {
                              const newPeriods = [...attendanceForm.periods];
                              newPeriods[index] = {
                                ...newPeriods[index],
                                present: e.target.checked
                              };
                              setAttendanceForm({
                                ...attendanceForm,
                                periods: newPeriods
                              });
                            }}
                          />
                        }
                        label="Present"
                      />
                    </Box>
                  ))}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Marking...' : 'Mark Attendance'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Image-based Attendance Section */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Image-based Attendance
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="image-period-select-label">Select Period</InputLabel>
                <Select
                  labelId="image-period-select-label"
                  value={selectedPeriod}
                  label="Select Period"
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  {periods.map((period) => (
                    <MenuItem key={period} value={period}>
                      Period {period}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button 
                  variant="contained" 
                  component="span" 
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Class Image
                </Button>
              </label>
            </Grid>
          </Grid>

          {attendanceData && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Attendance Results
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1">
                        Total Students: {attendanceData.total_students_in_database}
                      </Typography>
                      <Typography variant="subtitle1">
                        Detected Students: {attendanceData.total_matches}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography gutterBottom>
                        Similarity Threshold: {similarityThreshold}
                      </Typography>
                      <Slider
                        value={similarityThreshold}
                        onChange={(_, value) => setSimilarityThreshold(value)}
                        min={0}
                        max={1}
                        step={0.01}
                        valueLabelDisplay="auto"
                        sx={{ width: '100%' }}
                      />
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Attendance Details:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: '400px', overflow: 'auto' }}>
                    <Grid container spacing={2}>
                      {/* Present Students */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" color="success.main" gutterBottom>
                          Present Students
                        </Typography>
                        {processAttendanceData(attendanceData.matches, students)
                          .filter(student => student.present)
                          .map((student, index) => (
                            <Box 
                              key={`present-${student.rollNo}`}
                              sx={{ 
                                p: 1, 
                                bgcolor: 'success.light',
                                borderRadius: 1,
                                mb: 1,
                                color: 'white'
                              }}
                            >
                              <Typography variant="body2">
                                {student.rollNo} - {student.name}
                                <br />
                                <small>Similarity: {student.similarity.toFixed(3)}</small>
                              </Typography>
                            </Box>
                          ))}
                      </Grid>

                      {/* Absent Students */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" color="error.main" gutterBottom>
                          Absent Students
                        </Typography>
                        {processAttendanceData(attendanceData.matches, students)
                          .filter(student => !student.present)
                          .map((student, index) => (
                            <Box 
                              key={`absent-${student.rollNo}`}
                              sx={{ 
                                p: 1, 
                                bgcolor: 'error.light',
                                borderRadius: 1,
                                mb: 1,
                                color: 'white'
                              }}
                            >
                              <Typography variant="body2">
                                {student.rollNo} - {student.name}
                              </Typography>
                            </Box>
                          ))}
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3 }}
                  onClick={() => setShowConfirmDialog(true)}
                  fullWidth
                >
                  Confirm Attendance
                </Button>
              </CardContent>
            </Card>
          )}

          <Dialog 
            open={showConfirmDialog} 
            onClose={() => setShowConfirmDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Confirm Attendance</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to mark attendance for Period {selectedPeriod}?
                <br />
                Present Students: {Object.values(manualAttendance).filter(Boolean).length}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
              <Button onClick={handleConfirmAttendance} variant="contained">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Box>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 to-primary-900">
      <Container maxWidth="lg" sx={{ pt: 12, pb: 4 }}>
        <Box sx={{ width: '100%' }}>
          <AppBar 
            position="static" 
            sx={{ 
              borderRadius: 1, 
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
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
              <Tab label="Add Event" />
              <Tab label="Upload Marks" />
              <Tab label="Image Attendance" />
            </Tabs>
          </AppBar>

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
              <Typography variant="h5" className="text-white mb-4">
                Add New Event
              </Typography>
              <form onSubmit={handleAddEvent}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Event Title"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Date"
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="event-type-label">Type</InputLabel>
                      <Select
                        labelId="event-type-label"
                        id="event-type"
                        value={eventForm.type}
                        onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                        label="Type"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.23)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                          },
                        }}
                      >
                        <MenuItem value="activity">Activity</MenuItem>
                        <MenuItem value="holiday">Holiday</MenuItem>
                        <MenuItem value="exam">Exam</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      sx={{
                        mt: 2,
                        backgroundColor: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      }}
                    >
                      {loading ? 'Adding...' : 'Add Event'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </TabPanel>

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
              <Typography variant="h5" className="text-white mb-4">
                Upload Marks
              </Typography>
              {renderMarksForm()}
            </Paper>
          </TabPanel>

          <TabPanel value={value} index={2}>
            <ImageAttendanceSection />
          </TabPanel>
        </Box>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={severity}
            sx={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              color: 'white',
              '.MuiAlert-icon': {
                color: 'white',
              },
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
};

export default TeacherDashboard; 