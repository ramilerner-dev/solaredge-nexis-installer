export interface Step {
  id: number;
  title: string;
  instructions: string[];
  diagramFiles: string[]; // keys into DiagramImages — first entry is the primary display image
  hasPassCriteria?: boolean;
  passNote?: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: "Inverter Installation Planning",
    instructions: [
      "Confirm installation location: Indoor (room ≥ 2,200 ft³) or Outdoor (rain-protected)",
      "Inverter clearances: 12in. top and bottom, 4in. left & right",
      "Installation order: Inverter → Battery → BUI/Meter",
      "Power OFF all devices and circuit breakers before start",
    ],
    diagramFiles: ["page-09", "page-10"],
  },
  {
    id: 2,
    title: "Verify Boxes: Inverter 3ph and Battery Block",
    instructions: [
      "Inverter box: Nexis Inverter 3ph, wall bracket, M5 screws ×2, M4 screws ×2, power rating labels ×6",
      "Battery Link box: Battery Link, Battery Block foot ×4, wall bracket, filter, handles ×2, comm connectors ×2, cable gland, M5×12 screws ×4",
      "Battery Block box: SolarEdge Nexis Battery Block (Wall Mount Bracket sold separately)",
      "Tools: Drill, pencil, wire cutter, wire stripper, RJ45 crimping tool, hammer, level, torque wrench, Torx screwdriver set, Allen keys (M4/M5), watchmaker flat screwdriver",
    ],
    diagramFiles: ["page-02", "page-03", "page-04", "page-05"],
  },
  {
    id: 3,
    title: "Mount the Inverter",
    instructions: [
      "Mark drill points on the wall using the bracket as a template",
      "Drill holes, insert wall plugs, mount bracket with M5 screws",
      "Hang inverter on bracket; secure with M4 screws (T15, τ = 2.7 Nm)",
      "Verify inverter is level and all clearances are met",
    ],
    diagramFiles: ["page-14"],
  },
  {
    id: 4,
    title: "Install Battery Blocks",
    instructions: [
      "Use flattened battery packaging as a clean working surface",
      "Use 2 people to lift each Battery Block — 121 lbs each",
      "Floor mount: use tilt bracket; maintain 0.6–4 in. wall distance",
      "Level the bottom Battery Block by adjusting its feet",
      "Stack additional Battery Blocks (up to 4 per stack); click each into place",
      "Attach Battery Link on top of the stack",
    ],
    diagramFiles: [
      "page-23",
      "page-24",
      "page-25",
      "page-26",
      "page-27",
      "page-28",
    ],
    hasPassCriteria: true,
    passNote:
      "Battery Block LED blinks after Battery Link attachment → OK. No LED → FAIL. Contact SolarEdge support before proceeding.",
  },
  {
    id: 5,
    title: "Wire the Inverter (AC)",
    instructions: [
      'Turn OFF AC circuit breaker and set inverter P/1/0 switch to "0"',
      "Wait at least 5 minutes before opening any connections",
      "Connect AC cables: L1, L2, L3, N, PE per wiring diagram",
      "Circuit breaker rating must match inverter: 8kW→16A, 10kW→20A, 13kW→25A or 32A",
      "Torque all connections to values shown on the inverter label",
    ],
    diagramFiles: ["page-16", "page-15"],
    hasPassCriteria: true,
    passNote:
      "Physical tug test — each wire must resist pull after lever is locked. Circuit breaker rating must match inverter datasheet.",
  },
  {
    id: 6,
    title: "Wire the Battery (DC)",
    instructions: [
      "Turn OFF the Battery Link switch",
      "Wait 5 minutes before opening the Battery Link",
      "Release 6 captive screws (T25) to open the Battery Link cover",
      "Connect DC cables from Battery Link to Inverter: + to +, − to −",
      "Max cable distance: 165 ft using 10 AWG DC cable and shielded CAT7",
      "Tighten GND bus bar screws to specified torque for your wire gauge",
    ],
    diagramFiles: ["page-30", "page-29", "page-31"],
    hasPassCriteria: true,
    passNote:
      "DC polarity confirmed: + to +, − to −. Torque values met per wire gauge.",
  },
  {
    id: 7,
    title: "Wire Inverter Communications",
    instructions: [
      "Connect CAN bus H and L to Battery Link — must use the same twisted pair",
      "Connect LAN (Ethernet) cable to internet router",
      "Connect RS485 for Meter to terminals G, A, B",
      "Connect 12V output to BUI (if applicable)",
      "Optional: wire RRCR/14a relay if required by utility",
      "Optional: wire Manual Shutdown switch (MSD) — use N.C. type; tighten T15 screw to τ = 2.7 Nm",
    ],
    diagramFiles: ["page-18", "page-20", "page-22"],
  },
  {
    id: 8,
    title: "Wire Battery Communications",
    instructions: [
      "Connect CAN bus from Battery Link to Inverter CAN port — H and L must be the same twisted pair",
      "For multi-inverter setups: connect RS485 between inverters (leader/follower configuration)",
      "Ensure all communication connectors are fully seated and screws tightened",
    ],
    diagramFiles: ["page-21"],
  },
  {
    id: 9,
    title: "Wire the Meter (if applicable)",
    instructions: [
      "Connect Meter RS485 terminals: G, A, B",
      "Note: Nexis Inverter does NOT support SolarEdge Home Network",
      "Reinsert connector and tighten screws to τ = 2.7 Nm",
    ],
    diagramFiles: ["page-19"],
  },
  {
    id: 10,
    title: "Install Backup Interface / BUI (if applicable)",
    instructions: [
      "BUI is required only for backup (off-grid capable) installations",
      "Mount BUI unit per the BUI Quick Installation Guide",
      "Connect 12V DC from inverter to BUI",
      "Connect RS485 cable between BUI and inverter",
      "Verify BUI LED indicators per the BUI QIG before proceeding",
    ],
    diagramFiles: ["page-21"],
  },
  {
    id: 11,
    title: "Final Checks Before Power-On",
    instructions: [
      "Verify all DC cables: + to +, − to −",
      "Verify all communication cables are fully seated and screws tightened",
      "Verify all AC connections and torque values",
      "Confirm Battery Link switch is OFF",
      'Confirm inverter P/1/0 switch is at "0"',
    ],
    diagramFiles: ["page-13"],
  },
  {
    id: 12,
    title: "Power On the System",
    instructions: [
      "Turn ON the AC circuit breaker",
      'Set Battery Link switch to "1"',
      'Set BUI P/1/0 switch to "1" (if applicable)',
      'Set inverter P/1/0 switch to "1"',
      "Verify LED indicators — Blue: comms ok | Steady Green: producing/charging | Blinking Green: grid ok/standby | Red: FAULT",
      "Any Red LED: do NOT proceed to commissioning",
    ],
    diagramFiles: ["page-32", "page-33"],
    hasPassCriteria: true,
    passNote:
      "All LEDs non-red. Physical installation complete — proceed to GO commissioning.",
  },
];

export default STEPS;
