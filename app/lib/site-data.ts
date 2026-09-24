export type FileType = "BIOS bin" | "Boardview" | "Schematic" | "EC firmware";

export type LibraryFile = {
  id: string;
  model: string;
  brand: string;
  type: FileType;
  category: string;
  size: string;
  verified: boolean;
  description: string;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: "bios-dumps",
    name: "BIOS dumps",
    description: "SPI flash dumps ready for programming and recovery.",
    icon: "💾",
  },
  {
    slug: "boardviews",
    name: "Boardviews",
    description: "Interactive boardviews for component-level tracing.",
    icon: "🗺️",
  },
  {
    slug: "schematics",
    name: "Schematics",
    description: "Circuit schematics for power rails and signal paths.",
    icon: "📐",
  },
  {
    slug: "ec-firmware",
    name: "EC firmware",
    description: "Embedded controller images for power and keyboard issues.",
    icon: "⚙️",
  },
  {
    slug: "password-tools",
    name: "Password tools",
    description: "Guides and request paths for supervisor/BIOS unlocks.",
    icon: "🔓",
  },
  {
    slug: "me-regions",
    name: "ME / IFD regions",
    description: "Intel ME and flash descriptor regions for clean rebuilds.",
    icon: "🧩",
  },
  {
    slug: "pinouts",
    name: "Programmer pinouts",
    description: "SOIC clip and ISP pinouts for safe in-circuit dumps.",
    icon: "🔌",
  },
  {
    slug: "repair-guides",
    name: "Repair guides",
    description: "Step-by-step flash and recovery notes for common no-POST boards.",
    icon: "📘",
  },
];

export const LIBRARY_FILES: LibraryFile[] = [
  {
    id: "la-h994p",
    model: "LA-H994P",
    brand: "Dell",
    type: "BIOS bin",
    category: "bios-dumps",
    size: "12.0 MB",
    verified: true,
    description: "Clean SPI dump verified after liquid-damage recovery. Matches 25Q64 chip.",
  },
  {
    id: "da0x6tmbaf0",
    model: "DA0X6TMBAF0",
    brand: "HP",
    type: "Boardview",
    category: "boardviews",
    size: "8.4 MB",
    verified: true,
    description: "Boardview with silkscreen and net labels for common HP thin-client boards.",
  },
  {
    id: "nm-b441",
    model: "NM-B441",
    brand: "Lenovo",
    type: "BIOS bin",
    category: "bios-dumps",
    size: "16.0 MB",
    verified: true,
    description: "ThinkPad-family dump tested on matching NM-B441 revision.",
  },
  {
    id: "la-f841p",
    model: "LA-F841P",
    brand: "Toshiba",
    type: "Schematic",
    category: "schematics",
    size: "22.1 MB",
    verified: false,
    description: "Full schematic PDF set — pending second tech verification.",
  },
  {
    id: "x910-a1943",
    model: "X910-A1943",
    brand: "Surface",
    type: "BIOS bin",
    category: "bios-dumps",
    size: "6.0 MB",
    verified: true,
    description: "Surface firmware image for recovery after failed update.",
  },
  {
    id: "820-01700",
    model: "820-01700",
    brand: "Apple",
    type: "Boardview",
    category: "boardviews",
    size: "31.5 MB",
    verified: true,
    description: "MacBook boardview with rail highlights for common no-power paths.",
  },
  {
    id: "da0zaumb6f0",
    model: "DA0ZAUMB6F0",
    brand: "Asus",
    type: "BIOS bin",
    category: "bios-dumps",
    size: "9.0 MB",
    verified: false,
    description: "Community-submitted dump awaiting bench confirmation.",
  },
  {
    id: "edu-c13b",
    model: "EDU-C13B",
    brand: "Chromebook",
    type: "BIOS bin",
    category: "bios-dumps",
    size: "4.2 MB",
    verified: true,
    description: "Education Chromebook image used for enrollment-related recovery work.",
  },
  {
    id: "ec-nm-b441",
    model: "NM-B441-EC",
    brand: "Lenovo",
    type: "EC firmware",
    category: "ec-firmware",
    size: "512 KB",
    verified: true,
    description: "EC firmware companion for NM-B441 boards with stuck power LED.",
  },
  {
    id: "dell-pwd-guide",
    model: "DELL-SVC-TAG",
    brand: "Dell",
    type: "BIOS bin",
    category: "password-tools",
    size: "1.1 MB",
    verified: true,
    description: "Reference package and request notes for Dell service-tag unlock flow.",
  },
  {
    id: "me-clean-8mb",
    model: "ME-CLEAN-8MB",
    brand: "Dell",
    type: "BIOS bin",
    category: "me-regions",
    size: "8.0 MB",
    verified: true,
    description: "Clean ME + IFD region set for 8MB SPI rebuilds after corruption.",
  },
  {
    id: "soic8-isp-map",
    model: "SOIC8-ISP-MAP",
    brand: "HP",
    type: "Schematic",
    category: "pinouts",
    size: "420 KB",
    verified: true,
    description: "Common SOIC-8 clip and ISP pad map for CH341A / RT809F dumps.",
  },
  {
    id: "no-post-flash-guide",
    model: "NO-POST-FLASH",
    brand: "Lenovo",
    type: "BIOS bin",
    category: "repair-guides",
    size: "2.4 MB",
    verified: true,
    description: "Checklist for no-POST recovery: dump, clean ME, rewrite, first-boot notes.",
  },
];

/** @deprecated use LIBRARY_FILES */
export type LibraryItem = LibraryFile;
export const INITIAL_LIBRARY = LIBRARY_FILES;

export const FILTER_BRANDS = [
  "Dell",
  "HP",
  "Lenovo",
  "Toshiba",
  "Surface",
  "Apple",
  "Asus",
  "Chromebook",
] as const;

export const FILE_TYPES: FileType[] = [
  "BIOS bin",
  "Boardview",
  "Schematic",
  "EC firmware",
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
    desc: "Recover corrupted SPI dumps, blank display, and no-power boards with tested BIOS images.",
    price: "From $25",
  },
  {
    icon: "🔓",
    title: "Password Unlocking",
    desc: "BIOS, supervisor, and EFI password removal for Dell, HP, Lenovo, Apple, and more.",
    price: "From $15",
  },
  {
    icon: "🗺️",
    title: "Boardview Access",
    desc: "Search and download verified boardviews to speed up component-level troubleshooting.",
    price: "Library access",
  },
  {
    icon: "📐",
    title: "Schematic Access",
    desc: "Circuit schematics for power rails, charging paths, and display circuits.",
    price: "Library access",
  },
  {
    icon: "✅",
    title: "File Verification Request",
    desc: "Submit a dump for technician review before you flash a customer board.",
    price: "From $10",
  },
  {
    icon: "📤",
    title: "Custom File Request",
    desc: "Need a board number that is not listed yet? Open a request with the exact PCB stamp.",
    price: "Quote on request",
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
      "Fast turnaround on password unlocks. The team is responsive and professional. Best BIOS service I've found.",
    author: "Sarah Chen",
    role: "IT Service Provider",
  },
  {
    quote:
      "The schematics and boardviews are a lifesaver. I've fixed over 200 boards using resources from here.",
    author: "Michael Rodriguez",
    role: "Laptop Repair Technician",
  },
  {
    quote:
      "Clean dumps, clear notes, and verified tags I can trust before programming a chip.",
    author: "Amina Khan",
    role: "Board-level Tech",
  },
  {
    quote:
      "Requesting missing board numbers is easy — usually get a response the same day.",
    author: "Omar Farooq",
    role: "Service Center Owner",
  },
  {
    quote:
      "Password unlock flow for Dell and HP is straightforward. Telegram support is excellent.",
    author: "Lisa Nguyen",
    role: "Mobile Repair Desk",
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
    a: "Open the Contact page with the exact board number stamped on the PCB — LA, DA, or NM numbers help a lot — or register and submit a file request from your account later.",
  },
  {
    q: "Can a supervisor or BIOS password actually be removed?",
    a: "In most cases yes, depending on the brand and chipset. We support Dell, HP, Lenovo/ThinkPad, Toshiba, Surface, Apple EFI and Chromebook enrollment paths.",
  },
  {
    q: 'Is a file marked "verified" guaranteed to work on my exact board?',
    a: "Verified means a technician confirmed it flashed clean on the same board revision. Always match the chip part number and board revision before writing it to a customer's machine.",
  },
  {
    q: "Do I need an account to browse the library?",
    a: "You can browse and search publicly. Downloads and advanced requests may require login or registration depending on the file.",
  },
] as const;

export function getLibraryFile(id: string) {
  const decoded = decodeURIComponent(id).toLowerCase();
  return LIBRARY_FILES.find(
    (f) => f.id.toLowerCase() === decoded || f.model.toLowerCase() === decoded,
  );
}

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function filesInCategory(slug: string) {
  return LIBRARY_FILES.filter((f) => f.category === slug);
}

export function categoryFileCount(slug: string) {
  return filesInCategory(slug).length;
}
