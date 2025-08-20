import { motion, useReducedMotion } from "framer-motion";

export default function TopbarCMS() {
  const shouldReduceMotion = useReducedMotion();
  return (
  <div className="sticky top-0 z-20 hidden border-b border-green-100 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/70 lg:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-3 h-15">

      </div>
      {!shouldReduceMotion && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.5 }}
          // className="h-0.5 bg-gradient-to-r from-green-700 to-green-500"
          className="h-0.5 bg-black"
        />
      )}
    </div>
  );
}
