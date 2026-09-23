export type LibraryItem = {
  model: string;
  brand: string;
  type: string;
  size: string;
  verified: boolean;
};

export const INITIAL_LIBRARY: LibraryItem[] = [
  { model: "LA-H994P", brand: "Dell", type: "BIOS bin", size: "12.0 MB", verified: true },
  { model: "DA0X6TMBAF0", brand: "HP", type: "Boardview", size: "8.4 MB", verified: true },
  { model: "NM-B441", brand: "Lenovo", type: "BIOS bin", size: "16.0 MB", verified: true },
  { model: "LA-F841P", brand: "Toshiba", type: "Schematic", size: "22.1 MB", verified: false },
  { model: "X910-A1943", brand: "Surface", type: "BIOS bin", size: "6.0 MB", verified: true },
  { model: "820-01700", brand: "Apple", type: "Boardview", size: "31.5 MB", verified: true },
  { model: "DA0ZAUMB6F0", brand: "Asus", type: "BIOS bin", size: "9.0 MB", verified: false },
  { model: "EDU-C13B", brand: "Chromebook", type: "BIOS bin", size: "4.2 MB", verified: true },
];

export const BRANDS = [
  { name: "Dell", note: "Service-tag based unlock", icon: "💻" },
  { name: "HP", note: "Supervisor password removal", icon: "🖥️" },
  { name: "Lenovo", note: "EC + BIOS password support", icon: "🔒" },
  { name: "Toshiba", note: "Response-code unlock", icon: "📟" },
  { name: "Surface", note: "Firmware password removal", icon: "📱" },
  { name: "Apple", note: "EFI lock support", icon: "🍎" },
  { name: "Asus", note: "BIOS password reset", icon: "🔧" },
  { name: "Chromebook", note: "Enrollment removal", icon: "🌐" },
] as const;

export const SERVICES = [
  {
    icon: "🔌",
    title: "BIOS Flashing & Recovery",
    desc: "Corrupted BIOS? No power? Blank display? We flash, recover, and repair BIOS chips for all laptop models.",
    price: "From $25",
  },
  {
    icon: "🛠️",
    title: "Motherboard Rework",
    desc: "BGA rework, capacitor replacement, voltage regulator repair, and full motherboard restoration.",
    price: "From $45",
  },
  {
    icon: "🔓",
    title: "Password Unlocking",
    desc: "BIOS, supervisor, and EFI password removal for Dell, HP, Lenovo, Apple, and all major brands.",
    price: "From $15",
  },
  {
    icon: "📊",
    title: "Boardview & Schematics",
    desc: "Access to thousands of boardviews, schematics, and repair guides for motherboard troubleshooting.",
    price: "Free access",
  },
  {
    icon: "⚡",
    title: "Power Supply Repair",
    desc: "DC jack replacement, power IC repair, charging circuit troubleshooting, and battery management.",
    price: "From $30",
  },
  {
    icon: "🔍",
    title: "Diagnostic & Testing",
    desc: "Full board-level diagnostics with thermal imaging and oscilloscope testing to identify faults.",
    price: "From $20",
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "IMTIAZ BIOS saved my business! The boardview library is incredible and the BIOS files always work. Highly recommended.",
    author: "James Peterson",
    role: "Computer Repair Shop",
  },
  {
    quote:
      "Fast turnaround on password unlocks. The team is responsive and professional. Best BIOS repair service I've found.",
    author: "Sarah Chen",
    role: "IT Service Provider",
  },
  {
    quote:
      "The schematics and boardviews are a lifesaver for motherboard repair. I've fixed over 200 boards using resources from here.",
    author: "Michael Rodriguez",
    role: "Laptop Repair Technician",
  },
] as const;

export const FEATURES = [
  {
    icon: "✅",
    title: "Verified on real boards",
    desc: "Every listed file carries notes from the technician who flashed it, so you know what actually worked before you commit.",
  },
  {
    icon: "⚡",
    title: "Fast turnaround",
    desc: "Requests move through an active queue with technicians online across time zones — most board numbers get a response within hours.",
  },
  {
    icon: "👨‍🔧",
    title: "Direct human support",
    desc: "Stuck mid-repair? Reach the team directly instead of waiting on a support ticket.",
  },
  {
    icon: "📈",
    title: "Growing library",
    desc: "New BIOS dumps, EC firmware and boardviews are added by the community and our team every day.",
  },
] as const;

export const FAQS = [
  {
    q: "What exactly is a BIOS bin file?",
    a: "It's the firmware image pulled straight from a laptop's SPI flash chip. Writing back a clean, verified copy is the usual fix for boards stuck at no-power, blank display, or corrupted firmware after a repair.",
    open: true,
  },
  {
    q: "How do I request a file that isn't in the library yet?",
    a: "Use the upload panel to submit what you have, or fill in the contact form below with the exact board number stamped on the PCB — things like an LA-number, a DA-number or an NM-number help a lot.",
  },
  {
    q: "Can a supervisor or BIOS password actually be removed?",
    a: "In most cases yes, depending on the brand and chipset. We run separate request paths for Dell, HP, Lenovo/ThinkPad, Toshiba, Surface, Apple EFI and Chromebook enrollment — open a request under the matching brand.",
  },
  {
    q: 'Is a file marked "verified" guaranteed to work on my exact board?',
    a: "Verified means a technician confirmed it flashed clean on the same board revision. Always match the chip part number and board revision before writing it to a customer's machine.",
  },
  {
    q: "How much does motherboard repair cost?",
    a: "Prices vary depending on the issue. Basic BIOS flashing starts at $25, while complex motherboard rework can go up to $150. Contact us with your board number for a precise quote.",
  },
] as const;
