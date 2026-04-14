"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useTheme } from "../ui/ThemeContext";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

export const ContactUs = () => {
  const { theme } = useTheme();

  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView && !hasAnimated) setHasAnimated(true);
  }, [isInView, hasAnimated]);

  const container = {
    hidden: { opacity: 0, y: 50 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
  };

  const glass =
    theme === "light"
      ? "bg-white/20 border-white/20 text-gray-900"
      : "bg-gray-900/30 border-white/10 text-white";

  const inputStyle = `
    w-full px-4 py-3 rounded-xl 
    bg-transparent border 
    ${theme === "light" ? "border-gray-300 text-gray-900 placeholder-gray-500" : "border-white/20 text-white placeholder-white/50"}
    focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition
  `;

  return (
    <section ref={ref} className="py-32 relative">
      <div className="px-4 mx-auto max-w-6xl">

        {/* Heading */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={hasAnimated ? "show" : "hidden"}
          className="text-center mb-16"
        >
          <motion.h2
            variants={item}
            className={`text-4xl sm:text-5xl font-bold ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            Contact Us
          </motion.h2>

          <motion.p
            variants={item}
            className={`mt-4 ${
              theme === "light" ? "text-gray-600" : "text-white/70"
            }`}
          >
            Let’s build something amazing together 🚀
          </motion.p>
        </motion.div>

        {/* Contact Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={hasAnimated ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {/* Phone */}
          <motion.div
            variants={item}
            className={`p-6 rounded-2xl backdrop-blur-lg border ${glass} text-center hover:scale-105 transition`}
          >
            <FaPhoneAlt className="mx-auto text-2xl text-purple-500" />
            <p className="mt-4 font-medium">+91 98765 43210</p>
            <p className="opacity-70">+91 91234 56789</p>
          </motion.div>

          {/* Email */}
          <motion.div
            variants={item}
            className={`p-6 rounded-2xl backdrop-blur-lg border ${glass} text-center hover:scale-105 transition`}
          >
            <FaEnvelope className="mx-auto text-2xl text-blue-500" />
            <p className="mt-4 font-medium">support@preplup.com</p>
            <p className="opacity-70">info@preplup.com</p>
          </motion.div>

          {/* Location */}
          <motion.div
            variants={item}
            className={`p-6 rounded-2xl backdrop-blur-lg border ${glass} text-center hover:scale-105 transition`}
          >
            <FaMapMarkerAlt className="mx-auto text-2xl text-pink-500" />
            <p className="mt-4 font-medium">
              India • Remote First
            </p>
          </motion.div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={hasAnimated ? "show" : "hidden"}
          className={`rounded-3xl p-8 md:p-12 backdrop-blur-xl border ${glass}`}
        >
          <motion.h3
            variants={item}
            className="text-2xl font-semibold text-center mb-10"
          >
            Send a Message
          </motion.h3>

          <form className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <motion.input
              variants={item}
              type="text"
              placeholder="Your Name"
              className={inputStyle}
            />

            <motion.input
              variants={item}
              type="email"
              placeholder="Email Address"
              className={inputStyle}
            />

            <motion.input
              variants={item}
              type="text"
              placeholder="Phone Number"
              className={inputStyle}
            />

            <motion.input
              variants={item}
              type="text"
              placeholder="Company (optional)"
              className={inputStyle}
            />

            <motion.textarea
              variants={item}
              placeholder="Your Message..."
              rows={5}
              className={`${inputStyle} sm:col-span-2`}
            />

            <motion.div variants={item} className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500 text-white hover:opacity-90 transition"
              >
                Send Message
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
