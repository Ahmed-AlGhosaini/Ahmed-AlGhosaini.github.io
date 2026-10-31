// Each entry becomes a card on /projects and a page at /projects/<slug>.
// Order here = order on the site. Set `featured: true` to show it on the home page.

export type ProjectSection = {
  heading: string;
  paragraphs: string[];
  image?: { src: string; alt: string };
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  cover: string;
  tags: string[];
  date: string;
  role: string;
  featured?: boolean;
  links?: { github?: string; paper?: string; video?: string };
  body: ProjectSection[];
};

export const projects: Project[] = [
  {
    slug: "vla-humanoid-navigation",
    title: "Vision-Language-Action Model for Humanoid Robot Navigation",
    summary:
      "Master's thesis: an OpenVLA policy fine-tuned for language-conditioned humanoid navigation in dynamic environments. It covers everything from teleoperated data collection to deployment on the physical robot, and reaches a 90% success rate on real-world tasks.",
    cover: "/projects/vla-humanoid-navigation.svg",
    tags: ["VLA", "OpenVLA", "Imitation Learning", "ROS2", "PyTorch", "Humanoid"],
    date: "2026",
    role: "Master's thesis, imes, Leibniz University Hannover",
    featured: true,
    body: [
      {
        heading: "Overview",
        paragraphs: [
          "I fine-tuned a Vision-Language-Action foundation model (OpenVLA) via imitation learning so that a humanoid robot navigates according to natural-language instructions in dynamic environments. The policy predicts action chunks.",
        ],
      },
      {
        heading: "Data",
        paragraphs: [
          "I collected 300 robot episodes via teleoperation and built a multimodal dataset of camera video, robot state, LiDAR/depth and task outcomes.",
        ],
      },
      {
        heading: "System",
        paragraphs: [
          "Real-time LiDAR and depth streams are fused for obstacle avoidance, with the sensor data processed concurrently in a multithreaded pipeline. The policy is integrated into the robot's ROS2 software stack.",
          "I built the complete pipeline end to end: data collection, preprocessing, PyTorch training, real-time inference and deployment on the physical robot.",
        ],
      },
      {
        heading: "Results",
        paragraphs: ["The deployed policy achieves a 90% success rate on real-world tasks."],
      },
    ],
  },
  {
    slug: "rag-auditing-tool",
    title: "RAG Auditing Tool & AI Report Generation",
    summary:
      "An internal Retrieval-Augmented Generation tool for auditing at PwC that cuts manual auditing time by 50–60%, along with automated document-processing pipelines for AI-driven reports.",
    cover: "/projects/rag-auditing-tool.svg",
    tags: ["LLMs", "RAG", "Python", "Docker", "CI/CD"],
    date: "2024 — 2026",
    role: "Working student, PwC Germany",
    featured: true,
    body: [
      {
        heading: "Overview",
        paragraphs: [
          "I co-built an internal Retrieval-Augmented Generation (RAG) auditing tool that cuts manual auditing time by 50–60%.",
          "I also engineered automated, end-to-end document processing pipelines for AI-driven report generation.",
        ],
      },
      {
        heading: "Evaluation & engineering",
        paragraphs: [
          "I benchmarked LLMs, multimodal models and retrieval methods, and ran ML experiments for image and table processing. Everything shipped as production Python on Linux/Docker with Git and a CI/CD workflow.",
        ],
      },
    ],
  },
  {
    slug: "genomic-super-resolution",
    title: "Generative Super-Resolution for Genomic Data",
    summary:
      "Diffusion, CNN and GAN models for super-resolution of human genome data. The results exceeded state-of-the-art models, and the GAN work was my B.Sc. thesis (graded 1.0).",
    cover: "/projects/genomic-super-resolution.svg",
    tags: ["Diffusion Models", "GANs", "CNNs", "PyTorch"],
    date: "2023 — 2024",
    role: "Research assistant, TNT, Leibniz University Hannover",
    featured: true,
    body: [
      {
        heading: "Overview",
        paragraphs: [
          "As a research assistant at the Institute for Information Processing (TNT), I implemented and trained diffusion-model and CNN architectures in PyTorch (models, training loops, data loaders) for super-resolution of human genome data. The results exceeded state-of-the-art models.",
          "I also designed the preprocessing and evaluation pipelines that enable systematic comparison across model variants within the institute's genomic data science project.",
        ],
      },
      {
        heading: "B.Sc. thesis",
        paragraphs: ["This work builds on my bachelor's thesis, GAN-based deep super-resolution for genomic data, graded 1.0 (A+)."],
      },
    ],
  },
  {
    slug: "vibrosense-tactile-learning",
    title: "VibroSense: Tactile Sensing for Robot Learning",
    summary:
      "Physical-robot experiments to collect multimodal and tactile/force-sensing datasets, along with validation of robot-learning algorithms in MuJoCo and Isaac Gym.",
    cover: "/projects/vibrosense-tactile-learning.svg",
    tags: ["Tactile Sensing", "Reinforcement Learning", "MuJoCo", "Isaac Gym"],
    date: "2024",
    role: "Research assistant, L3S Research Center",
    body: [
      {
        heading: "Overview",
        paragraphs: [
          "In the VibroSense project I ran physical-robot experiments to collect multimodal and tactile/force-sensing datasets.",
          "I validated robot-learning algorithms, including reinforcement learning, and worked with the MuJoCo and Isaac Gym simulators. I also set up and maintained the lab's shared code repositories and their documentation.",
        ],
      },
    ],
  },
  {
    slug: "robocup-at-work",
    title: "RoboCup@Work Autonomous Mobile Manipulator",
    summary:
      "Software for the luhbots team's autonomous mobile manipulator in RoboCup@Work (industrial pick-and-place), with work on navigation and vision-based object recognition.",
    cover: "/projects/robocup-at-work.svg",
    tags: ["Mobile Manipulation", "Navigation", "Computer Vision", "ROS"],
    date: "2023 — 2024",
    role: "Software developer, luhbots",
    body: [
      {
        heading: "Overview",
        paragraphs: [
          "I co-developed software for an autonomous mobile manipulator competing in RoboCup@Work, an industrial pick-and-place competition, and improved the robot's autonomous navigation and vision-based object-recognition components on the real platform.",
        ],
      },
    ],
  },
  {
    slug: "tool-wear-prediction",
    title: "Tool Wear & Fault Prediction in Machining",
    summary:
      "Classification and regression models that predict tool wear and process faults in drilling and milling from real machine sensor data.",
    cover: "/projects/tool-wear-prediction.svg",
    tags: ["Machine Learning", "Sensor Data", "Manufacturing"],
    date: "2023",
    role: "Student assistant, IFW, Leibniz University Hannover",
    body: [
      {
        heading: "Overview",
        paragraphs: [
          "I built classification and regression models that predict tool wear and process faults in drilling and milling from real machine sensor data, including the raw-sensor preprocessing and augmentation pipeline.",
        ],
      },
    ],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
