"use client";

import { Carousel, Card } from "./ui_publics/HowItWorksEffect";
import { useState } from "react";
import { IconX } from "@tabler/icons-react";
import self_1 from "../../assets/self_1.png";
import self_2 from "../../assets/self_2.png";
import friend_1 from "../../assets/firend_1.png";
import friend_2 from "../../assets/firend_2.png";
import group from "../../assets/group.png";
import bgBlack from "../../assets/bg-black.png";

export function HowItWorksSetion() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openImageModal = (imageSrc) => {
    setSelectedImage(imageSrc);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
  };

  const data = getData(openImageModal);
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div id="how-it-works" className="w-full h-full py-10 scroll-mt-24">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-black font-sans">
        Bagaimana Cara kerjanya?
      </h2>
      <Carousel items={cards} />
      
      {/* Image Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-60"
            >
              <IconX size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Full size preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const DummyContent = ({ imageSrc, onImageClick }) => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
      <img
        src={imageSrc}
        alt="Reminder app interface mockup"
        height="300"
        width="300"
        className="w-3/4 h-auto mx-auto object-contain rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200"
        onClick={() => onImageClick(imageSrc)}
      />
    </div>
  );
};

const getData = (onImageClick) => [
  {
    category: "Pill Timer 10 Menit (Self Reminder)",
    title: "Pengingat WA super cepat—kirim ke dirimu 10 menit dari sekarang agar minum obat selalu tepat waktu. 💊",
    src: bgBlack,
    content: <DummyContent imageSrc={self_2} onImageClick={onImageClick} />,
  },
  {
    category: "Siram Tanaman Pagi (Self Reminder)",
    title: "Pengingat WA harian jam 07.00 yang menyapamu tiap pagi dan memastikan tanaman tak pernah terlewat. 🌿",
    src: bgBlack,
    content: <DummyContent imageSrc={self_1} onImageClick={onImageClick} />,
  },
  {
    category: "Split Bill, No Awkward (Friend Reminder)",
    title: "Follow-up patungan via WA sekitar jam 15.00 dengan pesan halus yang membantu tagih tanpa canggung. 💬",
    src: bgBlack,
    content: <DummyContent imageSrc={friend_1} onImageClick={onImageClick} />,
  },
  {
    category: "Meeting Ping: Sekali Kirim, Semua Ingat (Friend Reminder - multi)",
    title: "Satu pengingat WA ke banyak teman sekaligus untuk “Project X” jam 14.00—rapi, sopan, dan tepat waktu. ⏰",
    src: bgBlack,
    content: <DummyContent imageSrc={friend_2} onImageClick={onImageClick} />,
  },
  {
    category: "Standup Autopilot (Group Reminder)",
    title: "Jadwalkan pengingat WA ke grup tiap Senin 08.20; tim selalu on-track dan ritme kerja terjaga. 📊",
    src: bgBlack,
    content: <DummyContent imageSrc={group} onImageClick={onImageClick} />,
  },
];
