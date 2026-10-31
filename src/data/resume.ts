// Your CV content. Rendered on /resume. The "Download PDF" button serves /public/cv.pdf.

export type Experience = {
  role: string;
  company: string;
  location: string;
  period: string;
  points: string[];
};

export type Education = {
  degree: string;
  school: string;
  location: string;
  period: string;
  points?: string[];
};

export type Publication = {
  title: string;
  authors: string;
  venue: string;
  href?: string;
};

export type DatedItem = {
  date: string;
  title: string;
  issuer: string;
};

export const resume = {
  intro:
    "M.Sc. Computer Science with a focus on robot learning, Vision-Language-Action (VLA) and foundation models. I've built the full pipeline from teleoperated data collection to policies deployed on physical robots.",
  experience: [
    {
      role: "Master's Thesis Student: VLA Model for Humanoid Robot Navigation",
      company: "Institute of Mechatronic Systems (imes), Leibniz University Hannover",
      location: "Hannover, Germany",
      period: "Jan 2026 — Sep 2026",
      points: [
        "Fine-tuned a Vision-Language-Action foundation model (OpenVLA) via imitation learning for language-conditioned humanoid navigation in dynamic environments, with the policy predicting action chunks.",
        "Fused real-time LiDAR and depth streams for obstacle avoidance, processing the sensor data concurrently in a multithreaded pipeline, and integrated the policy into the ROS2 software stack.",
        "Collected 300 robot episodes via teleoperation and built the multimodal dataset (camera video, robot state, LiDAR/depth, task outcomes).",
        "Built the complete pipeline end to end (data collection, preprocessing, PyTorch training, real-time inference, deployment on the physical robot), achieving a 90% success rate on real-world tasks.",
      ],
    },
    {
      role: "Working Student: Data Science & Applied AI Engineering",
      company: "PwC Germany",
      location: "Berlin, Germany (Remote)",
      period: "Sep 2024 — Sep 2026",
      points: [
        "Benchmarked LLMs, multimodal models and retrieval methods, and ran ML experiments for image and table processing.",
        "Co-built an internal Retrieval-Augmented Generation (RAG) auditing tool, cutting manual auditing time by 50–60%.",
        "Engineered automated, end-to-end document processing pipelines for AI-driven report generation.",
        "Shipped production Python on Linux/Docker with Git and CI/CD workflow.",
      ],
    },
    {
      role: "Research Assistant: Robot Learning & Tactile Sensing",
      company: "L3S Research Center",
      location: "Hannover, Germany",
      period: "Jun 2024 — Sep 2024",
      points: [
        "Ran physical-robot experiments to collect multimodal and tactile/force-sensing datasets in the VibroSense project.",
        "Validated robot-learning algorithms, including reinforcement learning, and worked with simulations (MuJoCo and Isaac Gym).",
        "Set up and maintained the lab's shared code repositories and their documentation (Git).",
      ],
    },
    {
      role: "Research Assistant: Deep Learning & Generative Models",
      company: "Institute for Information Processing (TNT), Leibniz University Hannover",
      location: "Hannover, Germany",
      period: "Jan 2024 — Dec 2024",
      points: [
        "Implemented and trained diffusion-model and CNN architectures in PyTorch (models, training loops, data loaders) for super-resolution of human genome data, achieving results that exceeded state-of-the-art models.",
        "Designed the preprocessing and evaluation pipelines enabling systematic comparison across model variants within the institute's genomic data science project.",
      ],
    },
    {
      role: "Software Developer: Robotics & Computer Vision",
      company: "luhbots, RoboCup@Work Team, Leibniz University Hannover",
      location: "Hannover, Germany",
      period: "Dec 2023 — May 2024",
      points: [
        "Co-developed software for an autonomous mobile manipulator competing in RoboCup@Work (industrial pick-and-place).",
        "Improved the robot's autonomous navigation and vision-based object-recognition components on the real platform.",
      ],
    },
    {
      role: "Student Assistant: Machine Learning for Manufacturing",
      company: "Institute of Production Engineering and Machine Tools (IFW), Leibniz University Hannover",
      location: "Hannover, Germany",
      period: "Jun 2023 — Nov 2023",
      points: [
        "Built classification and regression models predicting tool wear and process faults in drilling and milling from real machine sensor data, including the raw-sensor preprocessing and augmentation pipeline.",
      ],
    },
    {
      role: "Working Student: Automobile Production",
      company: "Volkswagen",
      location: "Hannover, Germany",
      period: "Dec 2021 — Dec 2022",
      points: [
        "Assembled vehicle components on the series production line and operated the associated machines and systems (hands-on industrial operations experience).",
      ],
    },
  ] satisfies Experience[],
  education: [
    {
      degree: "M.Sc. Computer Science",
      school: "Leibniz University Hannover",
      location: "Hannover, Germany",
      period: "Oct 2023 — Sep 2026",
      points: [
        "Focus: Robotics, Computer Vision and Artificial Intelligence.",
        "Current grade: 1.2 (A+).",
        "Thesis: Vision-Language-Action (VLA) Model for Humanoid Robot Navigation.",
        "Relevant courses: Machine Learning (1.0), Computer Vision (1.0), Deep Learning (1.0), Robotik I (1.3), Statistical Natural Language Processing (1.0).",
        "Systems coursework (B.Sc./M.Sc.): Operating Systems, Computer Architecture, Parallel Computing, C++ and Java (OOP).",
      ],
    },
    {
      degree: "Exchange Semester",
      school: "Tokyo Metropolitan University",
      location: "Tokyo, Japan",
      period: "Apr 2026 — Sep 2026",
    },
    {
      degree: "Exchange Semester",
      school: "Università degli Studi di Napoli Federico II",
      location: "Naples, Italy",
      period: "Apr 2025 — Sep 2025",
    },
    {
      degree: "B.Sc. Mechatronics",
      school: "Leibniz University Hannover",
      location: "Hannover, Germany",
      period: "Oct 2019 — Sep 2023",
      points: [
        "Final grade: 1.9 (top 8% of students).",
        "Thesis: GAN-based deep super-resolution for genomic data, graded 1.0 (A+).",
      ],
    },
  ] satisfies Education[],
  skills: {
    "Robot Learning": ["VLA models", "Imitation learning", "Action chunking", "Reinforcement learning", "Diffusion models"],
    Robotics: ["ROS / ROS2", "MuJoCo", "NVIDIA Isaac Gym / Sim"],
    "Programming Languages": ["Python", "C / C++", "Java", "SQL", "Matlab"],
    "ML Frameworks": ["PyTorch", "Hugging Face Transformers", "TensorFlow", "Keras", "scikit-learn", "Pandas"],
    MLOps: ["Git", "Linux", "Docker", "CI/CD", "Slurm (GPU clusters)", "W&B", "MLflow", "Robot data pipelines"],
    "LLM Tooling": ["vLLM", "LangChain", "LlamaIndex", "DSPy", "FAISS", "Langfuse"],
  } as Record<string, string[]>,
  languages: [
    "English: fluent (C1)",
    "German: fluent (C1)",
    "Arabic: native",
    "Japanese, Spanish: beginner (A1)",
  ],
  // Add papers here; the Publications section only shows when this list is non-empty.
  publications: [] as Publication[],
  certifications: [
    { date: "May 2024", title: "Industrial Robot Programming", issuer: "KUKA College, Braunschweig" },
    { date: "Jan 2023", title: "Deep Learning Specialization", issuer: "Coursera" },
  ] satisfies DatedItem[],
  awards: [
    { date: "Apr 2026 — Sep 2026", title: "TMU Exchange Program Grant", issuer: "Tokyo Metropolitan University (TMU), Japan" },
    { date: "Apr 2026 — Sep 2026", title: "Promos Scholarship", issuer: "Leibniz University Hannover, Germany" },
    { date: "Apr 2025 — Sep 2025", title: "Erasmus+ Scholarship", issuer: "European Commission" },
    { date: "Oct 2024 — Sep 2025", title: "Deutschlandstipendium", issuer: "Leibniz University Hannover, Germany" },
    {
      date: "Apr 2018 — Sep 2023",
      title: "Government Scholarship for Academic Excellence",
      issuer: "Ministry of Higher Education and Scientific Research, Yemen",
    },
  ] satisfies DatedItem[],
  interests: ["Football and swimming", "Chess", "Reading", "Psychology and Philosophy"],
};
