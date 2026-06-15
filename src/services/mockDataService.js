// PlaceMentor AI - Mock Data Service

export const mockDataService = {
  // 1. Student Profile Data
  getStudentProfile: () => ({
    name: "Alex Rivera",
    email: "alex.rivera@engg.edu",
    usn: "1SR22CS045",
    branch: "Computer Science & Engineering",
    gpa: "8.9 / 10",
    skills: ["React.js", "JavaScript", "Tailwind CSS", "Node.js", "Python", "SQL", "Git"],
    targetRoles: ["Frontend Engineer", "Full Stack Developer", "Software Engineer"],
    readinessScore: 78, // out of 100
    readinessBreakdown: {
      resume: 82,
      skills: 75,
      interviews: 70,
      applications: 85
    },
    skillGaps: [
      { skill: "Docker", importance: "High", category: "DevOps" },
      { skill: "System Design", importance: "High", category: "Architecture" },
      { skill: "Jest / Unit Testing", importance: "Medium", category: "Testing" }
    ],
    nextBestActions: [
      { id: 1, action: "Update Resume with latest React projects to improve ATS score", type: "resume" },
      { id: 2, action: "Complete the Docker fundamentals workshop to resolve DevOps skill gap", type: "skill" },
      { id: 3, action: "Schedule a mock interview with mentor Prof. Sarah Jenkins", type: "mentorship" }
    ]
  }),

  // 2. Internship Marketplace Opportunities
  getInternships: () => [
    {
      id: "int_1",
      role: "Frontend Engineer Intern",
      company: "Stripe Technologies",
      stipend: "$1,200 / Month",
      skills: ["React.js", "JavaScript", "Tailwind CSS"],
      location: "San Francisco, CA (Remote)",
      type: "Remote",
      matchPercentage: 94,
      description: "Join our core billing team and help shape next-gen developer dashboards.",
      postedDate: "2 days ago"
    },
    {
      id: "int_2",
      role: "Software Development Intern",
      company: "Microsoft Research",
      stipend: "$1,500 / Month",
      skills: ["Python", "Algorithms", "Git"],
      location: "Redmond, WA (Hybrid)",
      type: "Hybrid",
      matchPercentage: 88,
      description: "Research and build scalable machine learning optimization pipelines.",
      postedDate: "1 week ago"
    },
    {
      id: "int_3",
      role: "Full Stack Engineer Intern",
      company: "Vercel Inc.",
      stipend: "$1,400 / Month",
      skills: ["React.js", "Node.js", "SQL", "Tailwind CSS"],
      location: "Remote",
      type: "Remote",
      matchPercentage: 92,
      description: "Work directly on Next.js framework APIs and analytics integration suites.",
      postedDate: "Just now"
    },
    {
      id: "int_4",
      role: "DevOps Cloud Intern",
      company: "Amazon Web Services",
      stipend: "$1,100 / Month",
      skills: ["Python", "Docker", "Git"],
      location: "Seattle, WA",
      type: "On-site",
      matchPercentage: 65,
      description: "Assist with automated cloud provisioning and ECS container deployment strategies.",
      postedDate: "3 days ago"
    }
  ],

  // 3. Application Tracker Pipelines
  getApplications: () => [
    {
      id: "app_1",
      role: "Frontend Engineer Intern",
      company: "Stripe Technologies",
      stipend: "$1,200 / Month",
      dateApplied: "2026-06-01",
      status: "Shortlisted", // Applied -> Under Review -> Shortlisted -> Interview Scheduled -> Selected -> Offer Received
      history: [
        { status: "Applied", date: "2026-06-01" },
        { status: "Under Review", date: "2026-06-03" },
        { status: "Shortlisted", date: "2026-06-07" }
      ]
    },
    {
      id: "app_2",
      role: "Full Stack Engineer Intern",
      company: "Vercel Inc.",
      stipend: "$1,400 / Month",
      dateApplied: "2026-06-10",
      status: "Applied",
      history: [
        { status: "Applied", date: "2026-06-10" }
      ]
    },
    {
      id: "app_3",
      role: "Software Engineering Intern",
      company: "Atlassian",
      stipend: "$1,300 / Month",
      dateApplied: "2026-05-15",
      status: "Offer Received",
      history: [
        { status: "Applied", date: "2026-05-15" },
        { status: "Under Review", date: "2026-05-17" },
        { status: "Shortlisted", date: "2026-05-22" },
        { status: "Interview Scheduled", date: "2026-05-28" },
        { status: "Selected", date: "2026-06-05" },
        { status: "Offer Received", date: "2026-06-12" }
      ]
    },
    {
      id: "app_4",
      role: "Backend Architect Intern",
      company: "Uber Technologies",
      stipend: "$1,250 / Month",
      dateApplied: "2026-05-20",
      status: "Interview Scheduled",
      history: [
        { status: "Applied", date: "2026-05-20" },
        { status: "Under Review", date: "2026-05-22" },
        { status: "Shortlisted", date: "2026-05-30" },
        { status: "Interview Scheduled", date: "2026-06-08" }
      ]
    }
  ],

  // 4. Student Upcoming Interviews
  getInterviews: () => [
    {
      id: "intv_1",
      company: "Uber Technologies",
      role: "Backend Architect Intern",
      date: "2026-06-18",
      time: "10:00 AM - 11:00 AM EST",
      type: "Technical Live Coding",
      interviewer: "Hana Lee (Principal Backend Lead)",
      status: "Confirmed",
      prepNotes: "Focus on Graph algorithms, Redis caching patterns, and SQL optimization keys.",
      aiReadiness: 72
    },
    {
      id: "intv_2",
      company: "Stripe Technologies",
      role: "Frontend Engineer Intern",
      date: "2026-06-22",
      time: "02:00 PM - 03:00 PM EST",
      type: "System Design & UI architecture",
      interviewer: "Marc Andre (Staff Frontend Dev)",
      status: "Scheduled",
      prepNotes: "Revise state management lifecycles, performance metrics, and CSS rendering paths.",
      aiReadiness: 85
    }
  ],

  // 5. Faculty Approvals Lists
  getPendingApprovals: () => [
    {
      id: "ap_1",
      studentName: "Daniel Craig",
      studentUsn: "1SR22IS012",
      role: "Data Analytics Intern",
      company: "Snowflake Inc.",
      type: "Internship Request",
      duration: "3 Months",
      dateSubmitted: "2026-06-14"
    },
    {
      id: "ap_2",
      studentName: "Emma Watson",
      studentUsn: "1SR22CS082",
      role: "Cybersecurity Analyst",
      company: "Palo Alto Networks",
      type: "NOC Request",
      duration: "6 Months",
      dateSubmitted: "2026-06-13"
    },
    {
      id: "ap_3",
      studentName: "Daniel Craig",
      studentUsn: "1SR22IS012",
      role: "AWS Cloud Foundations",
      company: "Coursera / Amazon",
      type: "Certificate Verification",
      duration: "Self-Paced",
      dateSubmitted: "2026-06-12"
    }
  ],

  // 6. Faculty Mentees
  getMentees: () => [
    { name: "Alex Rivera", usn: "1SR22CS045", gpa: "8.9", readiness: 78, internshipStatus: "Applying", ongoingPrep: "React & Docker" },
    { name: "Emma Watson", usn: "1SR22CS082", gpa: "9.2", readiness: 85, internshipStatus: "Placed", ongoingPrep: "Security Audit" },
    { name: "Brad Pitt", usn: "1SR22CS014", gpa: "7.4", readiness: 54, internshipStatus: "Not Started", ongoingPrep: "OOP Fundamentals" }
  ],

  // 7. Faculty Mentorship Log
  getMentorshipSessions: () => [
    { id: "m_1", studentName: "Alex Rivera", date: "2026-06-10", topic: "Resume review & Project optimization details", notes: "Alex needs to add DevOps keywords to pass Stripe's ATS parser. Excellent React basics." },
    { id: "m_2", studentName: "Brad Pitt", date: "2026-06-08", topic: "Basics of data structures & arrays review", notes: "Brad needs to focus heavily on mock codings and algorithm basics. Recommended Leetcode easy." }
  ],

  // 8. Admin Job Manager Postings
  getJobPostings: () => [
    { id: "job_1", role: "Software Engineering Intern", company: "Google", location: "Bangalore", applicantsCount: 145, status: "Open", stipend: "$1,800/mo" },
    { id: "job_2", role: "Cloud Developer", company: "Salesforce", location: "Hyderabad", applicantsCount: 89, status: "Open", stipend: "$1,300/mo" },
    { id: "job_3", role: "Database Engineer", company: "Oracle", location: "Bangalore", applicantsCount: 42, status: "Reviewing", stipend: "$1,200/mo" },
    { id: "job_4", role: "System Test Engineer", company: "Intel", location: "Delhi (NCR)", applicantsCount: 56, status: "Closed", stipend: "$1,100/mo" }
  ],

  // 9. Admin Placement Analytics Data
  getAdminStats: () => ({
    totalStudents: 320,
    placedStudents: 242,
    placedPercentage: 75.6,
    ongoingDrives: 12,
    avgSalaryPackage: "8.4 LPA",
    highestSalaryPackage: "42.0 LPA",
    unplacedCount: 78,
    branchStats: [
      { name: "CSE", total: 120, placed: 104, rate: 86.6 },
      { name: "ISE", total: 80, placed: 62, rate: 77.5 },
      { name: "ECE", total: 80, placed: 58, rate: 72.5 },
      { name: "EEE", total: 40, placed: 18, rate: 45.0 }
    ],
    recruitersList: [
      { name: "Google", tier: "Dream", offersCount: 5, status: "Verified" },
      { name: "Stripe", tier: "Dream", offersCount: 2, status: "Verified" },
      { name: "Atlassian", tier: "Super Dream", offersCount: 3, status: "Verified" },
      { name: "Amazon", tier: "Dream", offersCount: 14, status: "Verified" }
    ]
  }),

  // 10. Resume Analysis Mock Generator
  analyzeResumeText: (text) => {
    const score = Math.floor(Math.random() * 25) + 65; // generates a score between 65 and 90
    return {
      atsScore: score,
      formattingCheck: "Passed (1 inch margins, standard clean sans-serif layout found)",
      skillsFound: ["React.js", "JavaScript", "HTML", "CSS", "Git", "Node.js"],
      skillsMissing: ["Docker", "Kubernetes", "TypeScript", "Jest Testing"],
      suggestions: [
        "Include quantitative performance metrics (e.g. 'Optimized site speeds by 30%')",
        "Add Docker keyword and a simple containerization project to bypass specific DevOps filters",
        "Bold key developer technologies to improve visual scanning"
      ]
    };
  }
};
