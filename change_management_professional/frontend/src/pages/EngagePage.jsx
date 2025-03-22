import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
// Import video and audio assets
import backgroundVideo from "../assets/engagevideo.mp4";
import backgroundMusic from "../assets/engagemusic.mp3";

// Label component to show plant name
const PlantLabel = ({ name, position }) => {
  return (
    <Text
      position={position}
      fontSize={0.25}
      color="white"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.01}
      outlineColor="#000000"
    >
      {name}
    </Text>
  );
};

// Plant component with animation - now with different plant types
const Plant = ({ growth, onPotClick, onPlantClick, plantName, plantType }) => {
  const plantRef = useRef();
  const potRef = useRef();
  const [isGrowing, setIsGrowing] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const sparkleRefs = useRef([]);

  // Create sparkle effects when plant is ready to harvest
  useEffect(() => {
    if (growth >= 0.9) {
      // Create random sparkles around the plant
      const newSparkles = Array.from({ length: 15 }, () => ({
        position: [
          (Math.random() - 0.5) * 1.5,
          Math.random() * 2 + 1, // Higher up for bigger plants
          (Math.random() - 0.5) * 1.5,
        ],
        scale: Math.random() * 0.12 + 0.06, // Slightly larger sparkles
        rotation: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01,
      }));
      setSparkles(newSparkles);
    } else {
      setSparkles([]);
    }
  }, [growth]);

  // Animation for the plant growing and sparkles
  useFrame((state) => {
    if (plantRef.current) {
      // Gentle rotation for the whole plant
      plantRef.current.rotation.y += 0.003;

      // Growing animation
      if (isGrowing) {
        const currentScale = plantRef.current.scale.y;
        const targetScale = growth;

        // Smoothly animate to the target scale
        if (currentScale < targetScale - 0.01) {
          plantRef.current.scale.y += 0.01;
          plantRef.current.scale.x += 0.005;
          plantRef.current.scale.z += 0.005;
        } else {
          setIsGrowing(false);
        }
      } else {
        // Make sure plant is at the correct growth level - increased base size
        plantRef.current.scale.set(
          growth * 0.8 + 0.6, // Wider plants
          growth * 1.5, // Taller plants
          growth * 0.8 + 0.6 // Deeper plants
        );
      }
    }

    // Animate sparkles
    sparkleRefs.current.forEach((sparkle, i) => {
      if (sparkle && sparkles[i]) {
        sparkle.rotation.y += sparkles[i].speed;
        sparkle.rotation.z += sparkles[i].speed * 0.7;

        // Pulse scale
        const time = state.clock.getElapsedTime();
        const pulseFactor = Math.sin(time * 3 + i) * 0.2 + 0.8;
        sparkle.scale.set(
          sparkles[i].scale * pulseFactor,
          sparkles[i].scale * pulseFactor,
          sparkles[i].scale * pulseFactor
        );
      }
    });
  });

  // Set growing animation flag when growth changes
  useEffect(() => {
    setIsGrowing(true);
  }, [growth]);

  // Set different pot colors based on plant type
  let potColors = {
    main: "#F8E5D5", // Lighter beige
    rim: "#F0D4C0", // Slightly darker beige
    accent: "#E7C2A4", // Accent beige
  };

  // Set plant colors and elements based on plant type
  let plantColors = {
    stem: "#4CAF50",
    leaf: "#81C784",
    flower: "#E91E63",
    petal: "#F8BBD0",
  };

  // Customize pot and plant by type
  if (plantType === "internalGPT") {
    potColors = {
      main: "#E3F2FD", // Light blue
      rim: "#BBDEFB", // Lighter blue
      accent: "#90CAF9", // Accent blue
    };
    plantColors = {
      stem: "#43A047", // Darker green
      leaf: "#66BB6A", // Medium green
      flower: "#9C27B0", // Purple for AI
      petal: "#CE93D8", // Light purple
    };
  } else if (plantType === "hybridWork") {
    potColors = {
      main: "#FFF3E0", // Light orange
      rim: "#FFE0B2", // Lighter orange
      accent: "#FFCC80", // Accent orange
    };
    plantColors = {
      stem: "#5E35B1", // Deep purple
      leaf: "#7E57C2", // Indigo purple
      flower: "#FFC107", // Yellow
      petal: "#FFE082", // Light yellow
    };
  }

  // Different plant shapes based on type
  const renderPlantContent = () => {
    if (plantType === "internalGPT") {
      return (
        <>
          {/* Tech-inspired binary plant for Internal GPT */}
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.09, 0.12, 1.5, 8]} />
            <meshStandardMaterial color={plantColors.stem} />
          </mesh>

          {/* Data node leaves */}
          <mesh position={[0, 1.4, 0]}>
            <icosahedronGeometry args={[0.45, 1]} />
            <meshStandardMaterial
              color={plantColors.leaf}
              wireframe={growth < 0.7}
            />
          </mesh>

          {/* Additional data nodes - only visible at certain growth levels */}
          {growth > 0.4 && (
            <mesh position={[0.4, 1.0, 0]} rotation={[0, 0, Math.PI / 6]}>
              <octahedronGeometry args={[0.3, 1]} />
              <meshStandardMaterial
                color={plantColors.leaf}
                wireframe={growth < 0.7}
              />
            </mesh>
          )}

          {growth > 0.6 && (
            <mesh position={[-0.4, 1.1, 0]} rotation={[0, 0, -Math.PI / 6]}>
              <octahedronGeometry args={[0.3, 1]} />
              <meshStandardMaterial
                color={plantColors.leaf}
                wireframe={growth < 0.7}
              />
            </mesh>
          )}

          {/* Fully grown technological flower */}
          {growth > 0.9 && (
            <>
              <mesh position={[0, 2.0, 0]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial
                  color={plantColors.flower}
                  emissive={plantColors.flower}
                  emissiveIntensity={0.5}
                />
              </mesh>

              {/* Data streams/connections */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <mesh
                  key={i}
                  position={[
                    Math.sin((i * Math.PI) / 3) * 0.45,
                    2.0 + Math.cos((i * Math.PI) / 3) * 0.2,
                    Math.cos((i * Math.PI) / 3) * 0.45,
                  ]}
                >
                  <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
                  <meshStandardMaterial
                    color={plantColors.petal}
                    emissive={plantColors.petal}
                    emissiveIntensity={0.7}
                  />
                </mesh>
              ))}
            </>
          )}
        </>
      );
    } else if (plantType === "hybridWork") {
      return (
        <>
          {/* Split stem representing hybrid nature */}
          <mesh position={[-0.2, 0.5, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 1.0, 8]} />
            <meshStandardMaterial color={plantColors.stem} />
          </mesh>

          <mesh position={[0.2, 0.5, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 1.0, 8]} />
            <meshStandardMaterial color={plantColors.stem} />
          </mesh>

          {/* Main leaves - fan-shaped */}
          <mesh position={[-0.2, 1.0, 0]} rotation={[-0.3, 0, -0.4]}>
            <cylinderGeometry args={[0.35, 0, 0.7, 6, 1, false, 0, Math.PI]} />
            <meshStandardMaterial
              color={plantColors.leaf}
              side={THREE.DoubleSide}
            />
          </mesh>

          <mesh position={[0.2, 1.0, 0]} rotation={[-0.3, 0, 0.4]}>
            <cylinderGeometry args={[0.35, 0, 0.7, 6, 1, false, 0, Math.PI]} />
            <meshStandardMaterial
              color={plantColors.leaf}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Additional leaves */}
          {growth > 0.5 && (
            <>
              <mesh position={[-0.25, 1.5, 0]} rotation={[-0.4, 0, -0.6]}>
                <cylinderGeometry
                  args={[0.3, 0, 0.6, 6, 1, false, 0, Math.PI]}
                />
                <meshStandardMaterial
                  color={plantColors.leaf}
                  side={THREE.DoubleSide}
                />
              </mesh>

              <mesh position={[0.25, 1.5, 0]} rotation={[-0.4, 0, 0.6]}>
                <cylinderGeometry
                  args={[0.3, 0, 0.6, 6, 1, false, 0, Math.PI]}
                />
                <meshStandardMaterial
                  color={plantColors.leaf}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </>
          )}

          {/* Fully grown geometric flower */}
          {growth > 0.9 && (
            <>
              <mesh position={[0, 2.0, 0]}>
                <dodecahedronGeometry args={[0.3, 0]} />
                <meshStandardMaterial
                  color={plantColors.flower}
                  emissive={plantColors.flower}
                  emissiveIntensity={0.5}
                />
              </mesh>

              {/* Flower petals */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <mesh
                  key={i}
                  position={[
                    Math.sin((i * Math.PI * 2) / 8) * 0.45,
                    2.0 + Math.cos((i * Math.PI * 2) / 8) * 0.25,
                    0,
                  ]}
                  rotation={[0, 0, (i * Math.PI * 2) / 8]}
                >
                  <boxGeometry args={[0.15, 0.15, 0.04]} />
                  <meshStandardMaterial
                    color={plantColors.petal}
                    emissive={plantColors.petal}
                    emissiveIntensity={0.3}
                  />
                </mesh>
              ))}
            </>
          )}
        </>
      );
    } else {
      // Default plant (original design)
      return (
        <>
          {/* Stem */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.05, 0.1, 1, 8]} />
            <meshStandardMaterial color={plantColors.stem} />
          </mesh>

          {/* Main leaf */}
          <mesh position={[0, 1, 0]}>
            <sphereGeometry
              args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial
              color={plantColors.leaf}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Additional leaves - only visible at certain growth levels */}
          {growth > 0.4 && (
            <mesh position={[0.2, 0.7, 0]} rotation={[0, 0, Math.PI / 6]}>
              <sphereGeometry
                args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
              />
              <meshStandardMaterial
                color={plantColors.leaf}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {growth > 0.6 && (
            <mesh position={[-0.2, 0.8, 0]} rotation={[0, 0, -Math.PI / 6]}>
              <sphereGeometry
                args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
              />
              <meshStandardMaterial
                color={plantColors.leaf}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {growth > 0.8 && (
            <mesh position={[0, 1.2, 0]} rotation={[Math.PI, 0, 0]}>
              <sphereGeometry
                args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
              />
              <meshStandardMaterial
                color={plantColors.leaf}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {/* Flower appears when fully grown */}
          {growth > 0.9 && (
            <>
              <mesh position={[0, 1.4, 0]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color={plantColors.flower} />
              </mesh>

              {/* Flower petals */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <mesh
                  key={i}
                  position={[
                    Math.sin((i * Math.PI) / 3) * 0.2,
                    1.4 + Math.cos((i * Math.PI) / 3) * 0.1,
                    Math.cos((i * Math.PI) / 3) * 0.2,
                  ]}
                  rotation={[0, (i * Math.PI) / 3, 0]}
                >
                  <sphereGeometry
                    args={[0.08, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]}
                  />
                  <meshStandardMaterial
                    color={plantColors.petal}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              ))}
            </>
          )}
        </>
      );
    }
  };

  return (
    <group position={[0, -1, 0]}>
      {/* Plant Label */}
      <PlantLabel name={plantName} position={[0, -0.9, 0]} />

      {/* Flower Pot - SMALLER */}
      <group onClick={onPotClick}>
        {/* Main pot body */}
        <mesh ref={potRef} position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.5, 0.35, 0.6, 32]} />
          <meshStandardMaterial color={potColors.main} />
        </mesh>

        {/* Pot rim */}
        <mesh position={[0, -0.2, 0]}>
          <torusGeometry args={[0.5, 0.06, 16, 32]} />
          <meshStandardMaterial color={potColors.rim} />
        </mesh>

        {/* Pot hole (top opening) */}
        <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.05, 32]} />
          <meshStandardMaterial color="#8B5A2B" side={THREE.DoubleSide} />
        </mesh>

        {/* Soil */}
        <mesh position={[0, -0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.05, 32]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>

        {/* Decorative pot lines */}
        <mesh position={[0, -0.5, 0]}>
          <torusGeometry args={[0.38, 0.015, 8, 32]} />
          <meshStandardMaterial color={potColors.accent} />
        </mesh>
      </group>

      {/* Plant - content changes based on plant type, with increased base size */}
      <group ref={plantRef} position={[0, 0, 0]} onClick={onPlantClick}>
        {renderPlantContent()}
      </group>

      {/* Sparkles around harvestable plant */}
      {sparkles.map((sparkle, i) => (
        <mesh
          key={i}
          ref={(el) => (sparkleRefs.current[i] = el)}
          position={sparkle.position}
          rotation={[sparkle.rotation, sparkle.rotation, sparkle.rotation]}
        >
          <octahedronGeometry args={[sparkle.scale, 0]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFFF00"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
};

// Animated water effect when watering
const WaterEffect = ({ isWatering, position }) => {
  const groupRef = useRef();
  const particles = useRef([]);
  const [waterDrops, setWaterDrops] = useState([]);

  // Initialize water drops
  useEffect(() => {
    if (isWatering) {
      // Create random water drops
      const drops = Array.from({ length: 15 }, () => ({
        x: (Math.random() - 0.5) * 0.5,
        y: 0,
        z: (Math.random() - 0.5) * 0.5,
        speed: 0.03 + Math.random() * 0.03,
        size: 0.03 + Math.random() * 0.03,
      }));
      setWaterDrops(drops);
    } else {
      setWaterDrops([]);
    }
  }, [isWatering]);

  useFrame(() => {
    if (particles.current && particles.current.length > 0 && isWatering) {
      particles.current.forEach((particle, i) => {
        if (particle) {
          // Move particle down
          particle.position.y -= waterDrops[i]?.speed || 0.03;

          // Reset if it reaches the pot
          if (particle.position.y < -1) {
            particle.position.y = 0;
          }
        }
      });
    }
  });

  if (!isWatering) return null;

  return (
    <group ref={groupRef} position={position}>
      {waterDrops.map((drop, i) => (
        <mesh
          key={i}
          ref={(el) => (particles.current[i] = el)}
          position={[drop.x, drop.y, drop.z]}
        >
          <sphereGeometry args={[drop.size, 8, 8]} />
          <meshStandardMaterial color="#4FC3F7" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
};

// Camera setup for better view
const CameraSetup = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
};

// Video Background Component
const VideoBackground = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Set video to loop and autoplay silently
    if (videoRef.current) {
      videoRef.current.loop = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch((error) => {
        console.error("Video autoplay failed:", error);
      });
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <video
        ref={videoRef}
        className="absolute object-cover w-full h-full"
        src={backgroundVideo}
        playsInline
        autoPlay
        loop
        muted
      />
    </div>
  );
};

// Star Rating Component for Feedback
const StarRating = ({ rating, onRatingChange }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`w-8 h-8 focus:outline-none ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
          onClick={() => onRatingChange(star)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

// Main EngagePage component
const EngagePage = () => {
  // State management
  const [waterAmount, setWaterAmount] = useState(150); // Starting with 150ml of water

  // Plants state (now an array of plants)
  const [plants, setPlants] = useState([
    {
      id: "internalGPT",
      name: "Internal GPT",
      type: "internalGPT",
      growth: 0.6,
      displayGrowth: 0.6,
      position: [-2.2, 0, 0],
      link: "https://chat.openai.com",
    },
    {
      id: "hybridWork",
      name: "Hybrid Work",
      type: "hybridWork",
      growth: 0.7,
      displayGrowth: 0.7,
      position: [2.2, 0, 0],
      link: "https://teams.microsoft.com",
    },
  ]);

  const [points, setPoints] = useState(350); // Starting with 350 points
  const [isTabFullscreen, setIsTabFullscreen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isWatering, setIsWatering] = useState({
    internalGPT: false,
    hybridWork: false,
  });
  const [lastVisit, setLastVisit] = useState(null);
  const [showPointsEarned, setShowPointsEarned] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState("hybridWork"); // Default to Hybrid Work
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackFormData, setFeedbackFormData] = useState({
    campaign: "",
    feedback: "",
    rating: 0,
  });

  const audioRef = useRef(null);
  const containerRef = useRef(null);

  // Load saved data on initial render
  useEffect(() => {
    const savedWater = localStorage.getItem("plantWaterAmount");
    const savedPlants = localStorage.getItem("plants");
    const savedPoints = localStorage.getItem("plantPoints");

    if (savedWater) setWaterAmount(parseInt(savedWater, 10));
    if (savedPlants) setPlants(JSON.parse(savedPlants));
    if (savedPoints) setPoints(parseInt(savedPoints, 10));
  }, []);

  // Save data when it changes
  useEffect(() => {
    localStorage.setItem("plantWaterAmount", waterAmount.toString());
    localStorage.setItem("plants", JSON.stringify(plants));
    localStorage.setItem("plantPoints", points.toString());
  }, [waterAmount, plants, points]);

  // Handle tab fullscreen toggle
  const toggleTabFullscreen = () => {
    setIsTabFullscreen(!isTabFullscreen);
  };

  // Handle music toggle
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Audio play failed:", error);
        });
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  // Handle store button click
  const handleStoreClick = () => {
    // Placeholder for store functionality
    console.log("Store button clicked");
  };

  // Handle feedback button click
  const toggleFeedbackModal = () => {
    setShowFeedbackModal(!showFeedbackModal);
    if (!showFeedbackModal) {
      // Reset form when opening
      setFeedbackFormData({
        campaign: plants[0]?.id || "",
        feedback: "",
        rating: 0,
      });
    }
  };

  // Handle feedback form input changes
  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackFormData({
      ...feedbackFormData,
      [name]: value,
    });
  };

  // Handle rating change
  const handleRatingChange = (rating) => {
    setFeedbackFormData({
      ...feedbackFormData,
      rating,
    });
  };

  // Handle feedback form submission
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    console.log("Feedback submitted:", feedbackFormData);

    // Add 30ml of water as reward for feedback
    setWaterAmount((prev) => prev + 30);

    // Display success notification
    const notification = document.createElement("div");
    notification.className =
      "animate-bounce fixed text-white text-xl font-bold z-50";
    notification.style.left = "50%";
    notification.style.top = "30%";
    notification.style.transform = "translate(-50%, -50%)";
    notification.textContent = "Feedback submitted successfully!";
    document.body.appendChild(notification);

    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);

    // Close the modal
    setShowFeedbackModal(false);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User has switched tabs
        setLastVisit(new Date());
      } else {
        // User has returned
        if (lastVisit) {
          const timeSpentAway = (new Date() - lastVisit) / 1000; // in seconds

          // Award water if they spent at least 10 seconds away
          if (timeSpentAway >= 10) {
            // Calculate water earned (10ml per 10 seconds)
            const waterEarned = Math.floor(timeSpentAway / 10) * 10;

            setWaterAmount((prev) => prev + waterEarned);

            if (waterEarned > 0) {
              // Simple points notification
              const notification = document.createElement("div");
              notification.className =
                "animate-bounce fixed text-white text-xl font-bold z-50";
              notification.style.left = "50%";
              notification.style.top = "30%";
              notification.style.transform = "translate(-50%, -50%)";
              notification.textContent = `+${waterEarned}ml Water!`;
              document.body.appendChild(notification);

              setTimeout(() => {
                document.body.removeChild(notification);
              }, 2000);
            }
          }

          setLastVisit(null);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [lastVisit]);

  // Handle pot click for selected plant
  const handlePotClick = (plantId) => {
    const plant = plants.find((p) => p.id === plantId);
    if (plant) {
      window.open(plant.link, "_blank");
    }
  };

  // Handle plant click - now only for harvesting when fully grown
  const handlePlantClick = (plantId) => {
    setSelectedPlant(plantId);

    // Find the plant in our state
    const plant = plants.find((p) => p.id === plantId);
    if (!plant) return;

    // If fully grown, harvest for points
    if (plant.growth >= 0.9) {
      // Calculate points earned
      const pointsEarned = Math.floor(Math.random() * 50) + 50; // 50-100 points
      setPoints((prev) => prev + pointsEarned);

      // Reset this plant's growth
      setPlants((prev) =>
        prev.map((p) =>
          p.id === plantId ? { ...p, growth: 0.2, displayGrowth: 0.2 } : p
        )
      );

      // Show points earned notification
      setShowPointsEarned({ points: pointsEarned, timestamp: Date.now() });
      setTimeout(() => setShowPointsEarned(null), 3000);
    }
    // If not mature enough, show message
    else {
      // Simple notification
      const notification = document.createElement("div");
      notification.className =
        "animate-bounce fixed text-white text-xl font-bold z-50";
      notification.style.left = "50%";
      notification.style.top = "30%";
      notification.style.transform = "translate(-50%, -50%)";
      notification.textContent = "Water more to grow your plant!";
      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    }
  };

  // Handle watering the Hybrid Work plant only
  const handleWaterPlant = () => {
    if (waterAmount >= 10) {
      // Start watering animation for Hybrid Work plant only
      setIsWatering({
        internalGPT: false,
        hybridWork: true,
      });

      // Remove water from container
      setWaterAmount((prev) => prev - 10);

      // Update only Hybrid Work plant's display growth immediately for progress bar
      const updatedPlants = plants.map((plant) => {
        if (plant.id === "hybridWork") {
          const newGrowthValue = Math.min(plant.growth + 0.05, 1);
          return {
            ...plant,
            displayGrowth: newGrowthValue,
          };
        }
        return plant;
      });

      setPlants(updatedPlants);

      // Add actual growth to Hybrid Work plant after a delay (for animation)
      setTimeout(() => {
        setPlants((plants) =>
          plants.map((plant) => {
            if (plant.id === "hybridWork") {
              const newGrowthValue = Math.min(plant.growth + 0.05, 1);
              return {
                ...plant,
                growth: newGrowthValue,
              };
            }
            return plant;
          })
        );

        // Stop watering effect after animation
        setTimeout(() => {
          setIsWatering({
            internalGPT: false,
            hybridWork: false,
          });
        }, 1000);
      }, 1500);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${
        isTabFullscreen
          ? "fixed inset-0 z-50 bg-black"
          : "relative w-full h-screen"
      } overflow-hidden`}
    >
      {/* Video Background */}
      <VideoBackground />

      {/* Background Music */}
      <audio ref={audioRef} src={backgroundMusic} loop />

      {/* 3D Canvas */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Canvas>
          <CameraSetup />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <spotLight position={[0, 5, 5]} intensity={0.8} />

          {/* Render all plants */}
          {plants.map((plant) => (
            <group key={plant.id} position={plant.position}>
              <Plant
                growth={plant.growth}
                onPotClick={() => handlePotClick(plant.id)}
                onPlantClick={() => handlePlantClick(plant.id)}
                plantName={plant.name}
                plantType={plant.type}
              />

              <WaterEffect
                isWatering={isWatering[plant.id]}
                position={[0, 1.5, 0]}
              />
            </group>
          ))}

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* New Store Button */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-4">
        <button
          onClick={handleStoreClick}
          className="bg-indigo-600 rounded-full p-3 shadow-lg border-4 border-indigo-300 text-white hover:bg-indigo-500 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="font-bold">Store</span>
          </div>
        </button>

        {/* Points Counter (moved next to Store) */}
        <div className="bg-purple-500 rounded-full p-3 shadow-lg border-4 border-yellow-300">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center mr-2">
              <span className="text-purple-500 font-extrabold">P</span>
            </div>
            <span className="text-yellow-300 font-extrabold text-xl">
              {points}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Button */}
      <div className="absolute bottom-4 left-4 z-10">
        <button
          onClick={toggleFeedbackModal}
          className="bg-teal-500 rounded-full p-3 shadow-lg border-4 border-teal-300 text-white hover:bg-teal-400 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <span className="font-bold">Feedback</span>
          </div>
        </button>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Provide Feedback
              </h3>
              <button
                onClick={toggleFeedbackModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="campaign"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Campaign
                </label>
                <select
                  id="campaign"
                  name="campaign"
                  value={feedbackFormData.campaign}
                  onChange={handleFeedbackChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a campaign</option>
                  {plants.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      {plant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="rating"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Rating
                </label>
                <StarRating
                  rating={feedbackFormData.rating}
                  onRatingChange={handleRatingChange}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="feedback"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Feedback
                </label>
                <textarea
                  id="feedback"
                  name="feedback"
                  rows="4"
                  value={feedbackFormData.feedback}
                  onChange={handleFeedbackChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Please share your thoughts about this campaign..."
                  required
                ></textarea>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={toggleFeedbackModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Water Gauge */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-blue-500 rounded-full p-2 shadow-lg border-4 border-blue-200 flex items-center">
          <button
            onClick={handleWaterPlant}
            disabled={waterAmount < 10 || isWatering.hybridWork}
            className={`mr-2 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              waterAmount >= 10 && !isWatering.hybridWork
                ? "bg-blue-300 hover:bg-blue-200 text-blue-700"
                : "bg-gray-400 text-gray-600 cursor-not-allowed"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
          <div className="w-40 h-6 bg-blue-700 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-blue-300 transition-all duration-500"
              style={{ width: `${Math.min(100, (waterAmount / 200) * 100)}%` }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
              {waterAmount}ml
            </span>
          </div>
        </div>
      </div>

      {/* Growth Progress Bar - single bar for all plants */}
      <div className="absolute bottom-4 right-4 bg-green-500 rounded-lg p-2 shadow-lg border-4 border-green-300 z-10">
        <div className="flex flex-col">
          <span className="text-white text-xs font-bold mb-1 text-center">
            Growth Progress
          </span>
          <div className="w-32 h-4 bg-green-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-300 transition-all duration-500"
              style={{
                width: `${
                  (plants.reduce((sum, plant) => sum + plant.displayGrowth, 0) /
                    plants.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 flex space-x-3 z-10">
        {/* Tab Fullscreen Button */}
        <button
          onClick={toggleTabFullscreen}
          className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-4 border-green-300 text-white hover:bg-green-400 transition-colors"
        >
          {isTabFullscreen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          )}
        </button>

        {/* Music Button */}
        <button
          onClick={toggleMusic}
          className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center shadow-lg border-4 border-pink-300 text-white hover:bg-pink-400 transition-colors"
        >
          {isMusicPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072M12 6a9 9 0 010 12M8.464 8.464a5 5 0 010 7.072"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Points Earned Animation */}
      {showPointsEarned && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
          <div className="bg-yellow-400 text-purple-700 text-2xl font-extrabold px-6 py-3 rounded-full shadow-lg border-4 border-purple-500">
            +{showPointsEarned.points} Points!
          </div>
        </div>
      )}
    </div>
  );
};

export default EngagePage;
