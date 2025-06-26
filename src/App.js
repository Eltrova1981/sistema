import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  getDocs
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./index.css";

// Firebase configuration (provided by the Canvas environment)
const firebaseConfig = {};
// typeof __firebase_config !== "undefined" ? JSON.parse(__firebase_config) : {};
const appId = "default-app-id"; // typeof __app_id !== "undefined" ? __app_id : "default-app-id";
const initialAuthToken = null;
// typeof __initial_auth_token !== "undefined" ? __initial_auth_token : null;

// Firebase initialization
const app = {}; // initializeApp(firebaseConfig);
const db = {}; //getFirestore(app);
const auth = {}; //getAuth(app);
const storage = {}; //getStorage(app);

// Data for Peruvian geographical divisions (expanded with more specific examples)
const peruGeoData = {
  Amazonas: {
    Chachapoyas: ["Chachapoyas", "Asunción", "Balsas", "Cheto", "Chiliquín"],
    Bagua: ["Bagua", "Aramango", "Copallín", "El Parco"],
    Bongará: ["Jumbilla", "Chisquilla", "Corosha", "Cuispes"]
  },
  Áncash: {
    Aija: ["Aija", "Coris", "La Merced", "Succha", "Recreta"],
    "Antonio Raymondi": [
      "Llamellín",
      "Aczo",
      "Chaccho",
      "Chingas",
      "Mirgas",
      "San Juan de Rontoy"
    ],
    Asunción: ["Chacas", "Acochaca"],
    Bolognesi: [
      "Chiquián",
      "Abelardo Pardo",
      "Antonio Raymondi",
      "Aquia",
      "Cajacay",
      "Canis",
      "Colquioc",
      "Huasta",
      "La Primavera",
      "Mangas",
      "Pacllón",
      "San Miguel de Corpanqui",
      "Ticllos"
    ],
    Carhuaz: [
      "Carhuaz",
      "Acopampa",
      "Amashca",
      "Anta",
      "Ataquero",
      "Marcara",
      "Pariahuanca",
      "San Miguel de Aco",
      "Shilla",
      "Tinco",
      "Yungar"
    ],
    "Carlos F. Fitzcarrald": ["San Luis", "San Nicolás", "Yauya"],
    Casma: ["Casma", "Buena Vista", "Comandante Noel", "Yaután"],
    Corongo: [
      "Corongo",
      "Aco",
      "Bambas",
      "Cusca",
      "La Pampa",
      "Pacllón",
      "Yanac"
    ],
    Huaraz: [
      "Huaraz",
      "Cochabamba",
      "Colcabamba",
      "Huanchay",
      "Independencia",
      "Jangas",
      "La Libertad",
      "Olleros",
      "Pampas",
      "Pariacoto",
      "Pira",
      "Tarica"
    ],
    Huari: [
      "Huari",
      "Anra",
      "Cajay",
      "Chavín de Huantar",
      "Huacachi",
      "Huacchis",
      "Huachis",
      "Huallanca",
      "Masin",
      "Paucas",
      "Ponto",
      "Rahuapampa",
      "Rapayán",
      "San Marcos",
      "Uco"
    ],
    Huarmey: ["Huarmey", "Cochapeti", "Culebras", "Huayan", "Malvas"],
    Huaylas: [
      "Caraz",
      "Huata",
      "Huaylas",
      "Mato",
      "Pueblo Libre",
      "Pamparomas",
      "Santa Cruz",
      "Yuracmarca"
    ],
    "Mariscal Luzuriaga": [
      "Piscobamba",
      "Casca",
      "Eleazar Guzmán Barron",
      "Fidel Olivas Escudero",
      "Llama",
      "Llumpa",
      "Lucma",
      "Musga"
    ],
    Ocros: [
      "Ocros",
      "Acas",
      "Cajamarquilla",
      "Carhuapampa",
      "Cochas",
      "Congas",
      "Llipa",
      "San Cristóbal de Raján",
      "San Pedro",
      "Santiago de Chilcas"
    ],
    Pallasca: [
      "Cabana",
      "Bolognesi",
      "Conchucos",
      "Huacaschuque",
      "Huandoval",
      "Lacabamba",
      "Llapo",
      "Pallasca",
      "Pampas",
      "Santa Rosa",
      "Tauca"
    ],
    Pomabamba: ["Pomabamba", "Huayllan", "Parobamba", "Quinuabamba"],
    Recuay: [
      "Recuay",
      "Catac",
      "Cotaparaco",
      "Huayllapampa",
      "Marca",
      "Pararín",
      "Pashpa",
      "Tapacocha",
      "Ticapampa"
    ],
    Santa: [
      "Chimbote",
      "Cáceres del Perú",
      "Coishco",
      "Macate",
      "Moro",
      "Nepeña",
      "Nuevo Chimbote",
      "Samanco",
      "Santa"
    ],
    Sihuas: [
      "Sihuas",
      "Acobamba",
      "Alfonso Ugarte",
      "Cashapampa",
      "Chingalpo",
      "Huayllabamba",
      "La Briza",
      "San Juan",
      "Sicsibamba"
    ],
    Yungay: ["Yungay", "Cascapara", "Mancos", "Ranrahirca", "Shupluy", "Yanama"]
  },
  Apurímac: {
    Abancay: ["Abancay", "Chacoche", "Circa", "Curahuasi"],
    Andahuaylas: ["Andahuaylas", "Andarapa", "Chiara", "Huancarama"]
  },
  Arequipa: {
    Arequipa: [
      "Alto Selva Alegre",
      "Arequipa",
      "Cayma",
      "Cerro Colorado",
      "Characato",
      "Chiguata",
      "Jacob Hunter",
      "La Joya",
      "Mariano Melgar",
      "Miraflores",
      "Mollebaya",
      "Paucarpata",
      "Quequeña",
      "Sabandía",
      "Sachaca",
      "San Juan de Siguas",
      "San Juan de Tarucani",
      "Santa Isabel de Siguas",
      "Santa Rita de Siguas",
      "Socabaya",
      "Tiabaya",
      "Uchumayo",
      "Vitor",
      "Yanahuara",
      "Yarabamba",
      "Yura"
    ],
    Camaná: [
      "Camaná",
      "José María Quimper",
      "Mariano Nicolás Valcárcel",
      "Mariscal Cáceres",
      "Nicolás de Piérola",
      "Ocoña",
      "Quilca",
      "Samuel Pastor"
    ]
  },
  Ayacucho: {
    Huamanga: ["Ayacucho", "Acocro", "Acos Vinchos", "Carmen Alto"],
    Cangallo: [
      "Cangallo",
      "Chuschi",
      "Los Morochucos",
      "María Parado de Bellido"
    ]
  },
  Cajamarca: {
    Cajamarca: ["Cajamarca", "Asunción", "Chetilla", "Cospán"],
    Chota: ["Chota", "Anguía", "Chadin", "Chalamarca"]
  },
  Callao: {
    Callao: [
      "Bellavista",
      "Callao",
      "Carmen de la Legua Reynoso",
      "La Perla",
      "La Punta",
      "Ventanilla",
      "Mi Perú"
    ]
  },
  Cusco: {
    Cusco: [
      "Ccorca",
      "Cusco",
      "Poroy",
      "San Jerónimo",
      "San Sebastián",
      "Santiago",
      "Saylla",
      "Wanchaq"
    ],
    Calca: [
      "Calca",
      "Caldas",
      "Lares",
      "Machupicchu",
      "Pisac",
      "Quebrada",
      "San Salvador",
      "Yanatile"
    ]
  },
  Huancavelica: {
    Huancavelica: ["Huancavelica", "Acobambilla", "Acoria", "Ascensión"],
    Acobamba: ["Acobamba", "Andabamba", "Anta", "Caja"]
  },
  Huánuco: {
    Huánuco: ["Huánuco", "Amarilis", "Chinchao", "Churubamba"],
    Ambo: ["Ambo", "Cayna", "Colpas", "Huacar"]
  },
  Ica: {
    Ica: ["Ica", "La Tinguiña", "Los Aquijes", "Ocucaje"],
    Chincha: ["Chincha Alta", "Alto Larán", "Chavín", "Chincha Baja"]
  },
  Junín: {
    Huancayo: ["Huancayo", "Carhuacallanga", "Cochas", "Comas"],
    Jauja: ["Jauja", "Acolla", "Apata", "Curicaca"]
  },
  "La Libertad": {
    Trujillo: ["Trujillo", "El Porvenir", "Florencia de Mora", "Huanchaco"],
    Ascope: ["Ascope", "Chicama", "Chocope", "Magdalena de Cao"]
  },
  Lambayeque: {
    Chiclayo: [
      "Chiclayo",
      "Cayalti",
      "Chongoyape",
      "Eten",
      "José Leonardo Ortiz",
      "La Victoria",
      "Lagunas",
      "Monsefú",
      "Nueva Arica",
      "Oyotún",
      "Pátapo",
      "Pimentel",
      "Pucalá",
      "Reque",
      "Santa Rosa",
      "Tumán"
    ],
    Lambayeque: [
      "Lambayeque",
      "Chocope",
      "Illimo",
      "Mórrope",
      "Motupe",
      "Olmos",
      "Pacora",
      "Salas",
      "San José",
      "Túcume"
    ],
    Ferreñafe: [
      "Ferreñafe",
      "Cañaris",
      "Incahuasi",
      "Manuel Antonio Mesones Muro",
      "Pítipo",
      "Pueblo Nuevo"
    ] // Added Ferreñafe provinces and their districts
  },
  Lima: {
    Lima: [
      "Ancón",
      "Ate",
      "Barranco",
      "Breña",
      "Carabayllo",
      "Chaclacayo",
      "Chorrillos",
      "Cieneguilla",
      "Comas",
      "El Agustino",
      "Independencia",
      "Jesús María",
      "La Molina",
      "La Victoria",
      "Lince",
      "Los Olivos",
      "Lurigancho-Chosica",
      "Lurin",
      "Magdalena del Mar",
      "Miraflores",
      "Pachacámac",
      "Pucusana",
      "Pueblo Libre",
      "Puente Piedra",
      "Punta Hermosa",
      "Punta Negra",
      "Rimac",
      "San Bartolo",
      "San Borja",
      "San Isidro",
      "San Juan de Lurigancho",
      "San Juan de Miraflores",
      "San Luis",
      "San Martin de Porres",
      "San Miguel",
      "Santa Anita",
      "Santa María del Mar",
      "Santa Rosa",
      "Santiago de Surco",
      "Surquillo",
      "Villa El Salvador",
      "Villa María del Triunfo"
    ],
    Cañete: [
      "Asia",
      "Calango",
      "Cerro Azul",
      "Chilca",
      "Coayllo",
      "Imperial",
      "Lunahuaná",
      "Mala",
      "Nuevo Imperial",
      "Pacarán",
      "San Antonio",
      "San Luis",
      "San Vicente de Cañete",
      "Santa Cruz de Flores",
      "Zúñiga"
    ],
    Huaral: [
      "Aucallama",
      "Chancay",
      "Huaral",
      "Ihuarí",
      "Lampián",
      "Pacaraos",
      "San Miguel de Acos",
      "Sumar",
      "27 de Noviembre",
      "Atavillos Alto",
      "Atavillos Bajo"
    ],
    Barranca: ["Barranca", "Paramonga", "Pativilca", "Supe", "Supe Puerto"],
    Cajatambo: ["Cajatambo", "Copa", "Gorgor", "Manás", "Raura"],
    Canta: [
      "Canta",
      "Arahuay",
      "Huamantanga",
      "Huaros",
      "Lachaqui",
      "San Buenaventura",
      "Santa Rosa de Quives"
    ],
    Huarochirí: ["Matucana", "Antioquía", "Callahuanca", "Carampoma"],
    Huaura: [
      "Huacho",
      "Ambar",
      "Caleta de Carquín",
      "Checras",
      "Hualmay",
      "Leoncio Prado",
      "Paccho",
      "Santa Leonor",
      "Santa María",
      "Sayán",
      "Végueta"
    ],
    Oyón: ["Oyón", "Andajes", "Caujul", "Cochamarca", "Naván", "Pachangara"],
    Yauyos: ["Yauyos", "Alis", "Ayauca", "Ayaviri"]
  },
  Loreto: {
    Maynas: ["Iquitos", "Alto Nanay", "Fernando Lores", "Indiana"],
    Requena: ["Requena", "Alto Tapiche", "Capelo", "Emilio San Martín"]
  },
  "Madre de Dios": {
    Tambopata: ["Puerto Maldonado", "Inambari", "Laberinto", "Las Piedras"],
    Manu: ["Salvación", "Fitzcarrald", "Madre de Dios", "Huepetuhe"]
  },
  Moquegua: {
    "Mariscal Nieto": ["Moquegua", "Carumas", "Cuchumbaya", "Samegua"],
    "General Sánchez Cerro": ["Omate", "Chojata", "Coalaque", "Ichuña"]
  },
  Pasco: {
    Pasco: ["Chaupimarca", "Huachón", "Huariaca", "Huayllay", "Ninacaca"],
    "Daniel Alcides Carrión": [
      "Yanahuanca",
      "Chacayán",
      "Gollarisquizga",
      "Paucar"
    ]
  },
  Piura: {
    Piura: [
      "Castilla",
      "Catacaos",
      "Cura Mori",
      "El Tallán",
      "La Arena",
      "La Unión",
      "Las Lomas",
      "Piura",
      "Tambogrande"
    ],
    Sullana: ["Sullana", "Bellavista", "Ignacio Escudero", "Lancones"]
  },
  Puno: {
    Puno: [
      "Acora",
      "Amantani",
      "Atuncolla",
      "Capachica",
      "Chucuito",
      "Coata",
      "Huata",
      "Mañazo",
      "Paucarcolla",
      "Pichacani",
      "Platería",
      "Puno",
      "San Antonio",
      "Tiquillaca",
      "Vilque"
    ],
    Azángaro: [
      "Achaya",
      "Arapa",
      "Asillo",
      "Azángaro",
      "Caminaca",
      "Chupa",
      "José Domingo Choquehuanca",
      "Muñani",
      "Potoni",
      "Samán",
      "San Antón",
      "San José",
      "San Juan de Salinas",
      "Santiago de Pupuja",
      "Tirapata"
    ]
  },
  "San Martín": {
    Moyobamba: ["Moyobamba", "Calzada", "Habana", "Jepelacio"],
    Lamay: ["Lamay", "Chahuay", "Coya", "Dye", "Huayllabamba"]
  },
  Tacna: {
    Tacna: ["Tacna", "Alto de la Alianza", "Calana", "Ciudad Nueva"],
    Candarave: ["Candarave", "Camilaca", "Curibaya", "Huanuara"]
  },
  Tumbes: {
    Tumbes: ["Tumbes", "Corrales", "La Cruz", "Pampas de Hospital"],
    Zarumilla: ["Zarumilla", "Aguas Verdes", "Papayal", "San Juan de la Virgen"]
  },
  Ucayali: {
    "Coronel Portillo": ["Callería", "Campoverde", "Masisea", "Yarinacocha"],
    Atalaya: ["Raymondi", "Sepahua", "Tahuanía", "Yurúa"]
  }
};

function App() {
  // Estados para el formulario de ingreso (REGISTRO)
  const [phoneNumberInput, setPhoneNumberInput] = useState("");
  const [imeiInput, setImeiInput] = useState("");
  const [finalidadInput, setFinalidadInput] = useState("");
  const [ownerInput, setOwnerInput] = useState("");
  const [dniInput, setDniInput] = useState("");

  // State to control visibility of custom user fields for the primary involved number
  const [showPrimaryCustomUserFields, setShowPrimaryCustomUserFields] =
    useState(false);
  const [customUserInput, setCustomUserInput] = useState("");
  const [customUserDniInput, setCustomUserDniInput] = useState("");

  const [secondaryPhoneNumberInput, setSecondaryPhoneNumberInput] =
    useState("");
  const [secondaryOwnerInput, setSecondaryOwnerInput] = useState("");
  const [secondaryDniInput, setSecondaryDniInput] = useState("");

  // State for additional dynamic phone number entries (for section 2) - now includes customUser and customUserDni
  const [additionalPhoneEntries, setAdditionalPhoneEntries] = useState([]);

  // State for additional dynamic contact phone entries (for section 3)
  const [additionalContactPhoneEntries, setAdditionalContactPhoneEntries] =
    useState([]);

  const [carpetaFiscalInput, setCarpetaFiscalInput] = useState("");
  const [despachoInput, setDespachoInput] = useState("");
  const [celdaActivaInput, setCeldaActivaInput] = useState("");
  const [departamentoInput, setDepartamentoInput] = useState("");
  const [provinciaInput, setProvinciaInput] = useState("");
  const [distritoInput, setDistritoInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Estados para la carga y autenticación de datos
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState("Cargando...");
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  // Estado para la interfaz principal (initial, registro, consulta_simplificada, carga_masiva, graph_view, mapeo)
  const [viewMode, setViewMode] = useState("initial");

  // Estados para la interfaz de consulta simplificada
  const [searchCriteria, setSearchCriteria] = useState("phoneNumber");
  const [searchValue, setSearchValue] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [showNoResultsModal, setShowNoResultsModal] = useState(false); // Estado para el modal de no resultados

  // Estados para la carga masiva (CSV)
  const [csvFile, setCsvFile] = useState(null);
  const [batchUploadStatus, setBatchUploadStatus] = useState("");
  const [batchUploading, setBatchUploading] = useState(false);

  // New states for Mapeo view
  const [phoneNumber1MapInput, setPhoneNumber1MapInput] = useState("");
  const [phoneNumber2MapInput, setPhoneNumber2MapInput] = useState("");
  const [includeAllPhoneNumber1Map, setIncludeAllPhoneNumber1Map] =
    useState(false); // Checkbox for phone number 1
  const [includeAllPhoneNumber2Map, setIncludeAllPhoneNumber2Map] =
    useState(false); // Checkbox for phone number 2
  const [mapStatusMessage, setMapStatusMessage] = useState(""); // Status for map operations

  // States for 'Más Detalle' modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecordDetails, setSelectedRecordDetails] = useState(null);

  // Function to generate sample records
  const generateSampleRecords = (uid) => {
    const sampleRecords = [];
    const departments = Object.keys(peruGeoData);

    for (let i = 0; i < 10; i++) {
      const randomDeptIndex = Math.floor(Math.random() * departments.length);
      const randomDept = departments[randomDeptIndex];
      const provinces = Object.keys(peruGeoData[randomDept]);
      const randomProvIndex = Math.floor(Math.random() * provinces.length);
      const randomProv = provinces[randomProvIndex];
      const districts = peruGeoData[randomDept][randomProv];
      const randomDistIndex = Math.floor(Math.random() * districts.length);
      const randomDist = districts[randomDistIndex];

      sampleRecords.push({
        phoneNumber: `+51 9${Math.floor(
          100000000 + Math.random() * 900000000
        )}`,
        imei: `IMEI${Math.floor(
          100000000000000 + Math.random() * 900000000000000
        )}`,
        finalidad: i % 2 === 0 ? "Comunicacion" : "Pago",
        owner: `Titular Persona ${i + 1}`,
        dni: `DNI${Math.floor(10000000 + Math.random() * 90000000)}`,
        // Custom user and DNI are now sometimes filled in sample data, even if not displayed initially
        customUser: i % 2 === 0 ? `Usuario${i + 1}` : "",
        customUserDni:
          i % 2 === 0
            ? `UserDNI${Math.floor(1000000 + Math.random() * 9000000)}`
            : "",
        secondaryPhoneNumber:
          i % 3 === 0
            ? `+51 9${Math.floor(100000000 + Math.random() * 900000000)}`
            : "",
        secondaryOwner: i % 3 === 0 ? `Contacto Persona ${i + 1}` : "",
        secondaryDni:
          i % 3 === 0
            ? `ContactDNI${Math.floor(10000000 + Math.random() * 9000000)}`
            : "",
        additionalPhoneEntries:
          i % 2 === 0
            ? [
                // Add some additional involved numbers
                {
                  phoneNumber: `+51 9${Math.floor(
                    100000000 + Math.random() * 900000000
                  )}`,
                  imei: `ADDIMEI${Math.floor(
                    100000000000000 + Math.random() * 900000000000000
                  )}`,
                  finalidad: "Comunicacion",
                  owner: `Add. Titular ${i + 1}-A`,
                  dni: `Add. DNI ${Math.floor(
                    10000000 + Math.random() * 90000000
                  )}`,
                  customUser: `Add. User ${i + 1}-A`,
                  customUserDni: `Add. UserDNI ${Math.floor(
                    1000000 + Math.random() * 9000000
                  )}`,
                  showCustomUserFields: false // Added for each additional entry
                }
              ]
            : [],
        additionalContactPhoneEntries:
          i % 2 !== 0
            ? [
                // Add some additional contacted numbers
                {
                  phoneNumber: `+51 9${Math.floor(
                    100000000 + Math.random() * 900000000
                  )}`,
                  owner: `Add. Contact Titular ${i + 1}-B`,
                  dni: `Add. Contact DNI ${Math.floor(
                    10000000 + Math.random() * 90000000
                  )}`
                }
              ]
            : [],
        carpetaFiscal: `Carpeta-2024-${i + 1}`,
        despacho: ["Primer Despacho", "Segundo Despacho", "Tercer Despacho"][
          i % 3
        ],
        celdaActiva: `Calle Ficticia ${
          i + 1
        }, ${randomDist}, ${randomProv}, ${randomDept}`,
        departamento: randomDept,
        provincia: randomProv,
        distrito: randomDist,
        fileUrl: null,
        fileName: null,
        enteredBy: uid,
        timestamp: new Date(Date.now() - i * 3600 * 1000) // Recent timestamps
      });
    }
    return sampleRecords;
  };

  // Efecto para la autenticación y la escucha de datos en tiempo real
  useEffect(() => {
    const authenticateAndLoadData = async () => {
      try {
        let currentUser = auth.currentUser;
        if (!currentUser) {
          if (initialAuthToken) {
            const userCredential = await signInWithCustomToken(
              auth,
              initialAuthToken
            );
            currentUser = userCredential.user;
          } else {
            const userCredential = await signInAnonymously(auth);
            currentUser = userCredential.user;
          }
        }
        setUserId(currentUser.uid);
        setAuthReady(true);
      } catch (error) {
        console.error("Error al autenticar con Firebase:", error);
        setUserId("Error de autenticación");
        setLoading(false);
      }
    };

    const unsubscribeAuth = () => {};

    // const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    //   if (user) {
    //     setUserId(user.uid);
    //     setAuthReady(true);
    //   } else {
    //     setUserId(crypto.randomUUID());
    //     setAuthReady(true); // Still set authReady to true even for anonymous
    //   }
    //   setLoading(false);
    // });

    authenticateAndLoadData();
    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Efecto para escuchar datos de Firestore en tiempo real y generar datos de ejemplo si es necesario
  useEffect(() => {
    if (!authReady || !userId) return;

    const collectionPath = `artifacts/${appId}/public/data/phone_entries`;
    const q = query(collection(db, collectionPath));

    const unsubscribeSnapshot = onSnapshot(
      q,
      async (snapshot) => {
        const fetchedData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        fetchedData.sort(
          (a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0)
        );
        setData(fetchedData);

        // If no data exists, populate with sample data
        if (fetchedData.length === 0) {
          console.log("No existing records found. Generating sample data...");
          const sampleRecords = generateSampleRecords(userId);
          for (const record of sampleRecords) {
            try {
              await addDoc(collection(db, collectionPath), record);
            } catch (error) {
              console.error("Error adding sample record:", error);
            }
          }
          console.log("Sample data generated.");
        }
      },
      (error) => {
        console.error("Error al obtener datos de Firestore:", error);
      }
    );

    return () => unsubscribeSnapshot();
  }, [authReady, userId]);

  // Handle changes in Departamento dropdown
  useEffect(() => {
    setProvinciaInput(""); // Reset provincia when departamento changes
    setDistritoInput(""); // Reset distrito when departamento changes
  }, [departamentoInput]);

  // Handle changes in Provincia dropdown
  useEffect(() => {
    setDistritoInput(""); // Reset distrito when provincia changes
  }, [provinciaInput]);

  // Función para manejar la selección de archivos
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  // Function to add a new set of additional phone number fields (for section 2)
  const handleAddAdditionalPhoneNumber = () => {
    setAdditionalPhoneEntries([
      ...additionalPhoneEntries,
      {
        phoneNumber: "",
        imei: "",
        finalidad: "",
        owner: "",
        dni: "",
        customUser: "",
        customUserDni: "",
        showCustomUserFields: false
      }
    ]);
  };

  // Function to remove a set of additional phone number fields (for section 2)
  const handleRemoveAdditionalPhoneNumber = (indexToRemove) => {
    setAdditionalPhoneEntries(
      additionalPhoneEntries.filter((_, index) => index !== indexToRemove)
    );
  };

  // Function to handle changes in additional phone number fields (for section 2)
  const handleAdditionalInputChange = (index, field, value) => {
    const updatedEntries = [...additionalPhoneEntries];
    if (field === "toggleCustomUserFields") {
      updatedEntries[index].showCustomUserFields =
        !updatedEntries[index].showCustomUserFields;
      // Clear custom user fields if hiding them
      if (!updatedEntries[index].showCustomUserFields) {
        updatedEntries[index].customUser = ""; // Corrected typo here
        updatedEntries[index].customUserDni = "";
      }
    } else {
      updatedEntries[index][field] = value;
    }
    setAdditionalPhoneEntries(updatedEntries);
  };

  // Function to add a new set of additional contact phone number fields (for section 3)
  const handleAddAdditionalContactPhoneNumber = () => {
    setAdditionalContactPhoneEntries([
      ...additionalContactPhoneEntries,
      { phoneNumber: "", owner: "", dni: "" }
    ]);
  };

  // Function to remove a set of additional contact phone number fields (for section 3)
  const handleRemoveAdditionalContactPhoneNumber = (indexToRemove) => {
    setAdditionalContactPhoneEntries(
      additionalContactPhoneEntries.filter(
        (_, index) => index !== indexToRemove
      )
    );
  };

  // Function to handle changes in additional contact phone number fields (for section 3)
  const handleAdditionalContactInputChange = (index, field, value) => {
    const updatedEntries = [...additionalContactPhoneEntries];
    updatedEntries[index][field] = value;
    setAdditionalContactPhoneEntries(updatedEntries);
  };

  // Función para manejar el envío del formulario de ingreso
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumberInput.trim()) {
      setBatchUploadStatus("Por favor, ingresa el Número Telefónico 01.");
      return;
    }

    if (!despachoInput) {
      setBatchUploadStatus("Por favor, selecciona un Despacho.");
      return;
    }
    if (!finalidadInput) {
      setBatchUploadStatus("Por favor, selecciona la finalidad.");
      return;
    }

    if (!departamentoInput || !provinciaInput || !distritoInput) {
      setBatchUploadStatus(
        "Por favor, completa los campos de Departamento, Provincia y Distrito."
      );
      return;
    }

    if (!authReady || !userId) {
      setBatchUploadStatus(
        "La autenticación no está lista. Por favor, espera o recarga la página."
      );
      return;
    }

    setUploading(true);

    let fileUrl = null;
    let fileName = null;

    if (selectedFile) {
      try {
        const storageRef = ref(
          storage,
          `artifacts/${appId}/public/files/${userId}/${selectedFile.name}`
        );
        const uploadResult = await uploadBytes(storageRef, selectedFile);
        fileUrl = await getDownloadURL(uploadResult.ref);
        fileName = selectedFile.name;
        console.log("Archivo subido con éxito:", fileUrl);
      } catch (error) {
        console.error("Error al subir el archivo:", error);
        setBatchUploadStatus(
          "Hubo un error al subir el archivo. Inténtalo de nuevo."
        );
        setUploading(false);
        return;
      }
    }

    try {
      const collectionPath = `artifacts/${appId}/public/data/phone_entries`;
      await addDoc(collection(db, collectionPath), {
        phoneNumber: phoneNumberInput.trim(),
        imei: imeiInput.trim(),
        finalidad: finalidadInput,
        owner: ownerInput.trim(),
        dni: dniInput.trim(),
        // Only save customUser/Dni if the fields were shown and potentially filled
        customUser: showPrimaryCustomUserFields ? customUserInput.trim() : "",
        customUserDni: showPrimaryCustomUserFields
          ? customUserDniInput.trim()
          : "",
        secondaryPhoneNumber: secondaryPhoneNumberInput.trim(),
        secondaryOwner: secondaryOwnerInput.trim(),
        secondaryDni: secondaryDniInput.trim(),
        // Map additionalPhoneEntries to ensure showCustomUserFields is not saved, and values are cleared if hidden
        additionalPhoneEntries: additionalPhoneEntries.map((entry) => ({
          phoneNumber: entry.phoneNumber,
          imei: entry.imei,
          finalidad: entry.finalidad,
          owner: entry.owner,
          dni: entry.dni,
          customUser: entry.showCustomUserFields ? entry.customUser : "",
          customUserDni: entry.showCustomUserFields ? entry.customUserDni : ""
        })),
        additionalContactPhoneEntries: additionalContactPhoneEntries, // Store dynamic entries for section 3
        carpetaFiscal: carpetaFiscalInput.trim(),
        despacho: despachoInput,
        celdaActiva: celdaActivaInput.trim(),
        departamento: departamentoInput,
        provincia: provinciaInput,
        distrito: distritoInput,
        fileUrl: fileUrl,
        fileName: fileName,
        enteredBy: userId,
        timestamp: new Date()
      });
      // Reset form fields
      setPhoneNumberInput("");
      setImeiInput("");
      setFinalidadInput("");
      setOwnerInput("");
      setDniInput("");
      setCustomUserInput(""); // Reset custom user fields
      setCustomUserDniInput(""); // Reset custom user DNI fields
      setShowPrimaryCustomUserFields(false); // Hide the custom user fields after submission
      setSecondaryPhoneNumberInput("");
      setSecondaryOwnerInput("");
      setSecondaryDniInput("");
      setAdditionalPhoneEntries([]); // Reset additional entries for section 2
      setAdditionalContactPhoneEntries([]); // Reset additional entries for section 3
      setCarpetaFiscalInput("");
      setDespachoInput("");
      setCeldaActivaInput("");
      setDepartamentoInput("");
      setProvinciaInput("");
      setDistritoInput("");
      setSelectedFile(null);
      setBatchUploadStatus("Registro añadido exitosamente.");
    } catch (error) {
      console.error("Error al añadir el documento en Firestore:", error);
      setBatchUploadStatus(
        "Hubo un error al guardar los datos. Inténtalo de nuevo."
      );
    } finally {
      setUploading(false);
    }
  };

  // Función genérica para exportar datos a CSV
  const exportToExcel = (dataToExport, filenamePrefix) => {
    if (dataToExport.length === 0) {
      setBatchUploadStatus("No hay datos para exportar.");
      return;
    }

    // Extended headers for all possible fields, including additional phone entries
    const headers = [
      "Número Telefónico 01",
      "IMEI 01",
      "Finalidad 01",
      "Titular 01",
      "DNI Titular 01",
      "Usuario Personalizado 01", // Header for moved custom user
      "DNI Usuario Personalizado 01", // Header for moved custom user DNI
      "Teléfono 02", // Changed from "Número Telefónico 02"
      "Titular 02",
      "DNI Titular 02",
      "Carpeta Fiscal",
      "Despacho",
      "Celda Activa",
      "Departamento",
      "Provincia",
      "Distrito",
      "URL Archivo",
      "Nombre Archivo",
      "Ingresado Por",
      "Fecha de Ingreso"
    ];

    // Dynamically add headers for additional phone entries (section 2)
    const maxAdditionalEntries = dataToExport.reduce(
      (max, item) =>
        Math.max(
          max,
          item.additionalPhoneEntries ? item.additionalPhoneEntries.length : 0
        ),
      0
    );

    for (let i = 0; i < maxAdditionalEntries; i++) {
      headers.push(`Número Adicional ${i + 1}`);
      headers.push(`IMEI Adicional ${i + 1}`);
      headers.push(`Finalidad Adicional ${i + 1}`);
      headers.push(`Titular Adicional ${i + 1}`);
      headers.push(`DNI Titular Adicional ${i + 1}`);
      headers.push(`Usuario Personalizado Adicional ${i + 1}`); // New header for custom user in additional entries
      headers.push(`DNI Usuario Personalizado Adicional ${i + 1}`); // New header for custom user DNI in additional entries
    }

    // Dynamically add headers for additional contact phone entries (section 3)
    const maxAdditionalContactEntries = dataToExport.reduce(
      (max, item) =>
        Math.max(
          max,
          item.additionalContactPhoneEntries
            ? item.additionalContactPhoneEntries.length
            : 0
        ),
      0
    );

    for (let i = 0; i < maxAdditionalContactEntries; i++) {
      headers.push(`Número Contactado Adicional ${i + 1}`);
      headers.push(`Titular Contactado Adicional ${i + 1}`);
      headers.push(`DNI Contactado Adicional ${i + 1}`);
    }

    const rows = dataToExport.map((item) => {
      const row = [
        item.phoneNumber || "",
        item.imei || "",
        item.finalidad || "",
        item.owner || "",
        item.dni || "",
        item.customUser || "", // Now here
        item.customUserDni || "", // Now here
        item.secondaryPhoneNumber || "",
        item.secondaryOwner || "",
        item.secondaryDni || "",
        item.carpetaFiscal || "",
        item.despacho || "",
        item.celdaActiva || "",
        item.departamento || "",
        item.provincia || "",
        item.distrito || "",
        item.fileUrl || "",
        item.fileName || "",
        item.enteredBy,
        item.timestamp?.toDate().toLocaleString() || ""
      ];

      // Add data for additional phone entries (section 2)
      (item.additionalPhoneEntries || []).forEach((additionalEntry) => {
        row.push(additionalEntry.phoneNumber || "");
        row.push(additionalEntry.imei || "");
        row.push(additionalEntry.finalidad || "");
        row.push(additionalEntry.owner || "");
        row.push(additionalEntry.dni || "");
        row.push(additionalEntry.customUser || ""); // Add custom user to additional entries
        row.push(additionalEntry.customUserDni || ""); // Add custom user DNI to additional entries
      });

      // Fill remaining dynamic columns for section 2 with empty strings
      for (
        let i = (item.additionalPhoneEntries || []).length;
        i < maxAdditionalEntries;
        i++
      ) {
        row.push("", "", "", "", "", "", ""); // 7 empty strings for each additional entry block
      }

      // Add data for additional contact phone entries (section 3)
      (item.additionalContactPhoneEntries || []).forEach((contactEntry) => {
        row.push(contactEntry.phoneNumber || "");
        row.push(contactEntry.owner || "");
        row.push(contactEntry.dni || "");
      });

      // Fill remaining dynamic columns for section 3 with empty strings
      for (
        let i = (item.additionalContactPhoneEntries || []).length;
        i < maxAdditionalContactEntries;
        i++
      ) {
        row.push("", "", ""); // 3 empty strings for each additional contact entry block
      }

      return row;
    });

    let csvContent = headers.join(";") + "\n";
    csvContent += rows
      .map((e) =>
        e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${filenamePrefix}_${new Date()
          .toLocaleDateString()
          .replace(/\//g, "-")}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Función para manejar la búsqueda en la interfaz de consulta simplificada
  const handleSimplifiedSearch = () => {
    let currentFiltered = [...data];

    if (searchValue.trim()) {
      const lowerCaseSearchValue = searchValue.toLowerCase();
      currentFiltered = currentFiltered.filter((item) => {
        if (searchCriteria === "phoneNumber" && item.phoneNumber) {
          return item.phoneNumber.toLowerCase().includes(lowerCaseSearchValue);
        }
        if (
          searchCriteria === "secondaryPhoneNumber" &&
          item.secondaryPhoneNumber
        ) {
          return item.secondaryPhoneNumber
            .toLowerCase()
            .includes(lowerCaseSearchValue);
        }
        if (searchCriteria === "owner" && item.owner) {
          return item.owner.toLowerCase().includes(lowerCaseSearchValue);
        }
        if (searchCriteria === "dni" && item.dni) {
          return item.dni.toLowerCase().includes(lowerCaseSearchValue);
        }
        // Search by custom user and custom user DNI (now in section 2 primary or additional)
        if (searchCriteria === "customUser" && item.customUser) {
          return item.customUser.toLowerCase().includes(lowerCaseSearchValue);
        }
        if (searchCriteria === "customUserDni" && item.customUserDni) {
          return item.customUserDni
            .toLowerCase()
            .includes(lowerCaseSearchValue);
        }
        // Also check additional phone entries if needed for search (section 2)
        if (
          searchCriteria === "additionalPhoneNumbers" &&
          item.additionalPhoneEntries
        ) {
          return item.additionalPhoneEntries.some(
            (entry) =>
              (entry.phoneNumber &&
                entry.phoneNumber
                  .toLowerCase()
                  .includes(lowerCaseSearchValue)) ||
              (entry.owner &&
                entry.owner.toLowerCase().includes(lowerCaseSearchValue)) ||
              (entry.dni &&
                entry.dni.toLowerCase().includes(lowerCaseSearchValue)) ||
              (entry.customUser &&
                entry.customUser
                  .toLowerCase()
                  .includes(lowerCaseSearchValue)) || // Search in custom user in additional
              (entry.customUserDni &&
                entry.customUserDni
                  .toLowerCase()
                  .includes(lowerCaseSearchValue)) // Search in custom user DNI in additional
          );
        }
        // Also check additional contact phone entries if needed for search (section 3)
        if (
          searchCriteria === "additionalContactPhoneNumbers" &&
          item.additionalContactPhoneEntries
        ) {
          return item.additionalContactPhoneEntries.some(
            (entry) =>
              (entry.phoneNumber &&
                entry.phoneNumber
                  .toLowerCase()
                  .includes(lowerCaseSearchValue)) ||
              (entry.owner &&
                entry.owner.toLowerCase().includes(lowerCaseSearchValue)) ||
              (entry.dni &&
                entry.dni.toLowerCase().includes(lowerCaseSearchValue))
          );
        }
        return false;
      });
    } else {
      currentFiltered = [];
    }
    setFilteredResults(currentFiltered);

    // Mostrar modal si no hay resultados
    if (currentFiltered.length === 0 && searchValue.trim() !== "") {
      setShowNoResultsModal(true);
    }
  };

  // Función para resetear los filtros de búsqueda simplificada
  const resetSimplifiedSearch = () => {
    setSearchCriteria("phoneNumber");
    setSearchValue("");
    setFilteredResults([]);
  };

  // Función para abrir Google Maps con una o varias direcciones
  const openGoogleMaps = (addresses) => {
    if (!addresses || addresses.length === 0) {
      console.warn("No hay direcciones para mostrar en el mapa.");
      setMapStatusMessage("No hay ubicaciones para mostrar en el mapa.");
      return;
    }
    // Filter out empty/null addresses and encode them
    const validAddresses = addresses
      .filter(Boolean)
      .map((addr) => encodeURIComponent(addr.trim()));

    if (validAddresses.length === 0) {
      console.warn(
        "Todas las direcciones están vacías o son nulas. No se puede abrir Google Maps."
      );
      setMapStatusMessage(
        "Todas las direcciones están vacías o son nulas. No se puede abrir Google Maps."
      );
      return;
    }

    // Join addresses with ' OR ' for a general search query in Google Maps
    const query = validAddresses.join("+OR+");
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank"
    );
  };

  // Handle CSV file selection for batch upload
  const handleCsvFileChange = (e) => {
    if (e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setBatchUploadStatus("");
    } else {
      setCsvFile(null);
      setBatchUploadStatus("No se seleccionó ningún archivo.");
    }
  };

  // Handle batch CSV upload
  const handleBatchCsvUpload = async () => {
    if (!csvFile) {
      setBatchUploadStatus("Por favor, selecciona un archivo CSV.");
      return;
    }

    if (!authReady || !userId) {
      setBatchUploadStatus(
        "La autenticación no está lista. Por favor, espera o recarga la página."
      );
      return;
    }

    setBatchUploading(true);
    setBatchUploadStatus("Cargando y procesando el archivo CSV...");

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const lines = text.split("\n").filter((line) => line.trim() !== ""); // Filter out empty lines

        if (lines.length === 0) {
          setBatchUploadStatus("El archivo CSV está vacío.");
          setBatchUploading(false);
          return;
        }

        // Determine separator: try comma first, then semicolon
        let separator = ",";
        if (lines[0].includes(";")) {
          separator = ";";
        }

        const headers = lines[0]
          .split(separator)
          .map((header) => header.trim());
        const recordsToUpload = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(separator).map((value) => value.trim());

          // Fixed headers for main fields (updated to reflect customUser/customUserDni in section 2)
          const fixedHeaders = [
            "phoneNumber",
            "imei",
            "finalidad",
            "owner",
            "dni",
            "customUser",
            "customUserDni",
            "secondaryPhoneNumber",
            "secondaryOwner",
            "secondaryDni",
            "carpetaFiscal",
            "despacho",
            "celdaActiva",
            "departamento",
            "provincia",
            "distrito"
          ];

          let additionalEntriesData = [];
          let additionalContactEntriesData = [];

          // Identify the starting index of dynamic additional phone number fields (section 2)
          const firstAdditionalHeaderIndex = headers.findIndex((h) =>
            h.startsWith("Número Adicional")
          );
          // Identify the starting index of dynamic additional contact phone number fields (section 3)
          const firstAdditionalContactHeaderIndex = headers.findIndex((h) =>
            h.startsWith("Número Contactado Adicional")
          );

          // If dynamic headers exist, parse them (section 2)
          if (firstAdditionalHeaderIndex !== -1) {
            for (
              let k = firstAdditionalHeaderIndex;
              k < headers.length;
              k += 7
            ) {
              // Assuming 7 fields per additional entry now
              if (headers[k].startsWith("Número Adicional")) {
                const currentAdditionalEntry = {
                  phoneNumber: values[k] || "",
                  imei: values[k + 1] || "",
                  finalidad: values[k + 2] || "",
                  owner: values[k + 3] || "",
                  dni: values[k + 4] || "",
                  customUser: values[k + 5] || "", // Read custom user for additional involved numbers
                  customUserDni: values[k + 6] || "", // Read custom user DNI for additional involved numbers
                  showCustomUserFields: true // Assume visible when imported from CSV
                };
                additionalEntriesData.push(currentAdditionalEntry);
              } else {
                break; // Break if the pattern is not consistently found
              }
            }
          }

          // If dynamic headers exist, parse them (section 3)
          if (firstAdditionalContactHeaderIndex !== -1) {
            for (
              let k = firstAdditionalContactHeaderIndex;
              k < headers.length;
              k += 3
            ) {
              // Assuming 3 fields per additional contact entry
              if (headers[k].startsWith("Número Contactado Adicional")) {
                const currentAdditionalContactEntry = {
                  phoneNumber: values[k] || "",
                  owner: values[k + 1] || "",
                  dni: values[k + 2] || ""
                };
                additionalContactEntriesData.push(
                  currentAdditionalContactEntry
                );
              } else {
                break; // Break if the pattern is not consistently found
              }
            }
          }

          const record = {};
          fixedHeaders.forEach((header) => {
            const headerIndex = headers.indexOf(header);
            if (headerIndex !== -1) {
              record[header] = values[headerIndex];
            }
          });
          record.additionalPhoneEntries = additionalEntriesData; // Attach parsed additional entries (section 2)
          record.additionalContactPhoneEntries = additionalContactEntriesData; // Attach parsed additional contact entries (section 3)

          recordsToUpload.push(record);
        }

        if (recordsToUpload.length === 0) {
          setBatchUploadStatus(
            "No se encontraron datos válidos para cargar en el archivo CSV."
          );
          setBatchUploading(false);
          return;
        }

        const collectionPath = `artifacts/${appId}/public/data/phone_entries`;
        let successCount = 0;
        let errorCount = 0;

        for (const record of recordsToUpload) {
          try {
            // Basic validation for required fields for batch upload
            if (
              !record.phoneNumber ||
              !record.despacho ||
              !record.departamento ||
              !record.provincia ||
              !record.distrito ||
              !record.finalidad
            ) {
              console.warn(
                "Skipping record due to missing required fields:",
                record
              );
              errorCount++;
              continue;
            }

            // Ensure geographical data exists in our predefined lists
            const deptExists = peruGeoData[record.departamento];
            const provExists =
              deptExists && peruGeoData[record.departamento][record.provincia];
            const distExists =
              provExists &&
              peruGeoData[record.departamento][record.provincia].includes(
                record.distrito
              );

            if (!deptExists || !provExists || !distExists) {
              console.warn(
                "Skipping record due to invalid geographical data:",
                record
              );
              errorCount++;
              continue;
            }

            await addDoc(collection(db, collectionPath), {
              phoneNumber: record.phoneNumber || "",
              imei: record.imei || "",
              finalidad: record.finalidad || "",
              owner: record.owner || "",
              dni: record.dni || "",
              customUser: record.customUser || "", // Save custom user from record
              customUserDni: record.customUserDni || "", // Save custom user DNI from record
              secondaryPhoneNumber: record.secondaryPhoneNumber || "",
              secondaryOwner: record.secondaryOwner || "",
              secondaryDni: record.secondaryDni || "",
              additionalPhoneEntries: record.additionalPhoneEntries || [], // Save the parsed additional entries
              additionalContactPhoneEntries:
                record.additionalContactPhoneEntries || [], // Save the parsed additional contact entries
              carpetaFiscal: record.carpetaFiscal || "",
              despacho: record.despacho || "",
              celdaActiva: record.celdaActiva || "",
              departamento: record.departamento || "",
              provincia: record.provincia || "",
              distrito: record.distrito || "",
              fileUrl: null,
              fileName: null,
              enteredBy: userId,
              timestamp: new Date()
            });
            successCount++;
          } catch (docError) {
            console.error(
              "Error al añadir un documento en el lote:",
              docError,
              record
            );
            errorCount++;
          }
        }
        setBatchUploadStatus(
          `Carga masiva completada. Éxitos: ${successCount}, Errores: ${errorCount}.`
        );
        setCsvFile(null);
      };
      reader.onerror = () => {
        setBatchUploadStatus("Error al leer el archivo CSV.");
        setBatchUploading(false);
      };
      reader.readAsText(csvFile);
    } catch (error) {
      console.error("Error general en la carga masiva:", error);
      setBatchUploadStatus(
        "Ocurrió un error inesperado durante la carga masiva."
      );
    } finally {
      setBatchUploading(false);
    }
  };

  // Función para manejar el despliegue del mapa en la vista de Mapeo
  const handleMapDisplay = () => {
    setMapStatusMessage("Cargando ubicaciones para el mapa...");
    let addressesToMap = [];

    // Collect addresses based on selected checkboxes and manual inputs
    if (includeAllPhoneNumber1Map) {
      data.forEach((item) => {
        if (
          item.phoneNumber &&
          item.celdaActiva &&
          item.celdaActiva.trim() !== ""
        ) {
          addressesToMap.push(item.celdaActiva.trim());
        }
      });
    }
    if (includeAllPhoneNumber2Map) {
      data.forEach((item) => {
        if (
          item.secondaryPhoneNumber &&
          item.celdaActiva &&
          item.celdaActiva.trim() !== ""
        ) {
          addressesToMap.push(item.celdaActiva.trim());
        }
      });
    }

    // If no checkboxes are selected, use manual inputs
    if (!includeAllPhoneNumber1Map && !includeAllPhoneNumber2Map) {
      const p1 = phoneNumber1MapInput.trim();
      const p2 = phoneNumber2MapInput.trim();

      if (p1) {
        // Check primary, secondary, and additional numbers for p1
        const entry1 = data.find(
          (item) =>
            item.phoneNumber === p1 ||
            item.secondaryPhoneNumber === p1 ||
            (item.additionalPhoneEntries &&
              item.additionalPhoneEntries.some(
                (ap) => ap.phoneNumber === p1
              )) ||
            (item.additionalContactPhoneEntries &&
              item.additionalContactPhoneEntries.some(
                (acp) => acp.phoneNumber === p1
              ))
        );
        if (entry1 && entry1.celdaActiva && entry1.celdaActiva.trim() !== "") {
          addressesToMap.push(entry1.celdaActiva.trim());
        }
      }
      if (p2 && p2 !== p1) {
        // Avoid adding the same number twice if both inputs are the same
        // Check primary, secondary, and additional numbers for p2
        const entry2 = data.find(
          (item) =>
            item.phoneNumber === p2 ||
            item.secondaryPhoneNumber === p2 ||
            (item.additionalPhoneEntries &&
              item.additionalPhoneEntries.some(
                (ap) => ap.phoneNumber === p2
              )) ||
            (item.additionalContactPhoneEntries &&
              item.additionalContactPhoneEntries.some(
                (acp) => acp.phoneNumber === p2
              ))
        );
        if (entry2 && entry2.celdaActiva && entry2.celdaActiva.trim() !== "") {
          addressesToMap.push(entry2.celdaActiva.trim());
        }
      }
    }

    addressesToMap = [...new Set(addressesToMap)]; // Ensure uniqueness

    if (addressesToMap.length > 0) {
      openGoogleMaps(addressesToMap);
      setMapStatusMessage("Ubicaciones mostradas en Google Maps.");
    } else {
      setMapStatusMessage(
        'No se encontraron ubicaciones de "Celda Activa" para los números especificados o en la base de datos.'
      );
    }
  };

  // Cálculo de estadísticas básicas
  const totalEntries = data.length;

  // Contar entradas por usuario
  const entriesByUser = data.reduce((acc, item) => {
    const user = item.enteredBy || "Desconocido";
    acc[user] = (acc[user] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-100 p-4'>
        <p className='text-lg text-gray-700'>Cargando aplicación...</p>
      </div>
    );
  }

  return (
    // Darker, richer background
    <div className='min-h-screen bg-gradient-to-br from-blue-900 via-indigo-950 to-purple-950 p-4 font-sans antialiased'>
      {/* Reduced space-y and padding */}
      <div className='max-w-5xl mx-auto bg-white rounded-3xl shadow-3xl p-6 md:p-9 space-y-6 relative transform transition-all duration-500 ease-in-out'>
        {/* Header - Común a todas las vistas */}
        {/* Reduced pb */}
        <header className='text-center pb-3.5 border-b-2 border-indigo-300'>
          {/* Reduced mb */}
          <h1
            className='text-4xl md:text-5xl font-extrabold text-gray-900 mb-2.5 drop-shadow-lg leading-tight'
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            SISTEMA COLABORATIVO DE JEREMIAS Y DIL
          </h1>
          {/* Reduced top/right */}
          <div className='absolute top-6 right-6 text-sm text-gray-600 font-mono bg-indigo-100 px-4 py-2 rounded-full shadow-md border border-indigo-200'>
            ID de Usuario:{" "}
            <strong className='text-indigo-800'>
              {userId.substring(0, 8)}...
            </strong>
          </div>
        </header>

        {/* Vista Inicial con imágenes y botones mejorados */}
        {viewMode === "initial" && (
          // Reduced padding
          <section className='flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-9 text-white min-h-[550px] relative overflow-hidden transform hover:scale-[1.005] transition-transform duration-500 ease-in-out border border-gray-700'>
            <img
              src='/_api/content/fetch?contentFetchId=uploaded:Basel_02.jpg-3ef943bf-dfee-4dee-aed3-8eeb238ffd6b&fileName=Basel_02.jpg'
              alt='[Image of Basel Institute on Governance offices]'
              className='absolute inset-0 w-full h-full object-cover rounded-3xl opacity-15 blur-sm'
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/1200x600/1a202c/e2e8f0?text=Imagen%20no%20disponible";
              }}
            />
            <div className='relative z-10 flex flex-col items-center justify-center h-full w-full'>
              {/* Reduced mb */}
              <h3 className='text-3xl md:text-4xl font-bold text-center mb-8 text-white drop-shadow-xl'>
                Elige una opción para continuar:
              </h3>
              {/* Reduced gap */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl'>
                <button
                  onClick={() => setViewMode("consulta_simplificada")}
                  className='flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-700 to-indigo-800 text-white text-2xl font-bold rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-80 transition duration-300 ease-in-out transform border border-purple-500 hover:border-purple-300'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-18 w-18 mb-4 opacity-90'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                  CONSULTA
                </button>
                <button
                  onClick={() => setViewMode("registro")}
                  className='flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-700 to-indigo-800 text-white text-2xl font-bold rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-80 transition duration-300 ease-in-out transform border border-blue-500 hover:border-blue-300'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-18 w-18 mb-4 opacity-90'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  REGISTRO
                </button>
                <button
                  onClick={() => setViewMode("mapeo")}
                  className='flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-700 to-emerald-800 text-white text-2xl font-bold rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-80 transition duration-300 ease-in-out transform border border-green-500 hover:border-green-300'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-18 w-18 mb-4 opacity-90'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                  MAPEO
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Vista de REGISTRO */}
        {viewMode === "registro" && (
          <>
            {/* Botones Volver al Inicio y Importar Registros */}
            {/* Reduced mb */}
            <div className='flex justify-between items-center mb-5'>
              <button
                onClick={() => setViewMode("initial")}
                className='px-6 py-3 bg-gray-700 text-white text-base font-medium rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 transition duration-200 ease-in-out transform hover:scale-105'
              >
                ← Volver al Inicio
              </button>
              <button
                onClick={() => setViewMode("carga_masiva")}
                className='px-6 py-3 bg-gradient-to-r from-teal-500 to-green-600 text-white text-base font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 transition duration-200 ease-in-out'
              >
                Importar Registros (CSV)
              </button>
            </div>

            {/* Formulario de Ingreso */}
            {/* Reduced padding */}
            <section className='bg-blue-50 p-5 rounded-2xl shadow-xl border border-blue-200'>
              {/* Reduced mb */}
              <h2 className='text-3xl font-bold text-gray-800 mb-5 text-center'>
                Ingresar Nuevos Datos
              </h2>
              {/* Reduced space-y */}
              <form onSubmit={handleSubmit} className='space-y-7'>
                {/* Sección 1: Datos de la Carpeta */}
                {/* Reduced padding */}
                <div className='border border-blue-300 bg-white rounded-xl p-4 shadow-lg'>
                  {/* Reduced mb, pb */}
                  <h3 className='text-2xl font-semibold text-blue-800 mb-4 border-b pb-3 border-blue-200'>
                    1) Datos de la Carpeta
                  </h3>
                  {/* Reduced gap */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label
                        htmlFor='carpetaFiscal'
                        className='block text-sm font-semibold text-gray-700 mb-1'
                      >
                        Carpeta Fiscal:
                      </label>
                      <input
                        type='text'
                        id='carpetaFiscal'
                        className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                        value={carpetaFiscalInput}
                        onChange={(e) => setCarpetaFiscalInput(e.target.value)}
                        placeholder='Número de Carpeta Fiscal'
                      />
                    </div>
                    <div>
                      <label
                        htmlFor='despacho'
                        className='block text-sm font-semibold text-gray-700 mb-1'
                      >
                        Despacho:
                      </label>
                      <select
                        id='despacho'
                        className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out appearance-none bg-white pr-8'
                        value={despachoInput}
                        onChange={(e) => setDespachoInput(e.target.value)}
                        required
                      >
                        <option value=''>Selecciona un Despacho</option>
                        <option value='Primer Despacho'>Primer Despacho</option>
                        <option value='Segundo Despacho'>
                          Segundo Despacho
                        </option>
                        <option value='Tercer Despacho'>Tercer Despacho</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sección 2: Datos del número involucrado */}
                {/* Reduced padding */}
                <div className='border border-blue-300 bg-white rounded-xl p-4 shadow-lg'>
                  {/* Reduced mb, pb */}
                  <h3 className='text-2xl font-semibold text-blue-800 mb-4 border-b pb-3 border-blue-200'>
                    2) Datos del número involucrado
                  </h3>
                  {/* Reduced gap */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* Fixed First Phone Number Fields */}
                    <div>
                      <label
                        htmlFor='phoneNumber'
                        className='block text-sm font-semibold text-gray-700 mb-1'
                      >
                        Número Telefónico 01:
                      </label>
                      <input
                        type='text'
                        id='phoneNumber'
                        className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                        value={phoneNumberInput}
                        onChange={(e) => setPhoneNumberInput(e.target.value)}
                        placeholder='Ej: +51 987654321'
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor='imei'
                        className='block text-sm font-semibold text-gray-700 mb-1'
                      >
                        IMEI:
                      </label>
                      <input
                        type='text'
                        id='imei'
                        className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                        value={imeiInput}
                        onChange={(e) => setImeiInput(e.target.value)}
                        placeholder='Código IMEI del dispositivo (opcional)'
                      />
                    </div>
                    {/* Owner and DNI on the same row */}
                    <div>
                      <label
                        htmlFor='owner'
                        className='block text-sm font-semibold text-gray-700 mb-1'
                      >
                        Titular:
                      </label>
                      <input
                        type='text'
                        id='owner'
                        className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                        value={ownerInput}
                        onChange={(e) => setOwnerInput(e.target.value)}
                        placeholder='Nombre del titular'
                      />
                    </div>
                    <div>
                      <label
                        htmlFor='dni'
                        className='block text-sm font-semibold text-gray-700 mb-1'
                      >
                        DNI del Titular:
                      </label>
                      <input
                        type='text'
                        id='dni'
                        className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                        value={dniInput}
                        onChange={(e) => setDniInput(e.target.value)}
                        placeholder='Número de DNI del titular (opcional)'
                      />
                    </div>
                    {/* Finalidad field */}
                    <div>
                      <label
                        htmlFor='finalidad'
                        className='block text-sm font-semibold text-gray-700 mb-1'
                      >
                        Finalidad:
                      </label>
                      <select
                        id='finalidad'
                        className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out appearance-none bg-white pr-8'
                        value={finalidadInput}
                        onChange={(e) => setFinalidadInput(e.target.value)}
                        required
                      >
                        <option value=''>Selecciona una Finalidad</option>
                        <option value='Comunicacion'>Comunicación</option>
                        <option value='Pago'>Pago</option>
                      </select>
                    </div>
                    {/* Link to show/hide custom user fields */}
                    {/* Reduced mt */}
                    <div className='col-span-1 md:col-span-2 flex justify-end mt-1.5'>
                      <button
                        type='button'
                        onClick={() => {
                          setShowPrimaryCustomUserFields(
                            !showPrimaryCustomUserFields
                          );
                          if (showPrimaryCustomUserFields) {
                            // If hiding, clear the inputs
                            setCustomUserInput("");
                            setCustomUserDniInput("");
                          }
                        }}
                        className='text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition duration-150 ease-in-out'
                      >
                        {showPrimaryCustomUserFields
                          ? "Ocultar opciones de usuario"
                          : "Mostrar más opciones de usuario"}
                      </button>
                    </div>
                    {/* Custom User and DNI conditionally rendered */}
                    {showPrimaryCustomUserFields && (
                      <>
                        <div>
                          <label
                            htmlFor='customUser'
                            className='block text-sm font-semibold text-gray-700 mb-1'
                          >
                            Ingresar Usuario (posesionario):
                          </label>
                          <input
                            type='text'
                            id='customUser'
                            className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                            value={customUserInput}
                            onChange={(e) => setCustomUserInput(e.target.value)}
                            placeholder='Ej: Nombre de usuario o ID'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor='customUserDni'
                            className='block text-sm font-semibold text-gray-700 mb-1'
                          >
                            DNI de Usuario (Personalizado):
                          </label>
                          <input
                            type='text'
                            id='customUserDni'
                            className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                            value={customUserDniInput}
                            onChange={(e) =>
                              setCustomUserDniInput(e.target.value)
                            }
                            placeholder='DNI del usuario personalizado (opcional)'
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Add New Phone Number Button (for section 2) */}
                  {/* Reduced mt, pt */}
                  <div className='mt-5 border-t pt-3.5 border-blue-200 flex justify-end'>
                    <button
                      type='button'
                      onClick={handleAddAdditionalPhoneNumber}
                      className='flex items-center justify-center px-5 py-2.5 border border-dashed border-purple-400 text-purple-700 font-medium rounded-lg hover:bg-purple-100 transition duration-200 ease-in-out'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-6 w-6 mr-2'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                          clipRule='evenodd'
                        />
                      </svg>
                      Agregar otro número (Involucrado)
                    </button>
                  </div>

                  {/* Dynamically Added Phone Number Fields (for section 2) */}
                  {additionalPhoneEntries.map((entry, index) => (
                    // Reduced mt, pt, padding
                    <div
                      key={index}
                      className='mt-6 pt-4 border-t border-blue-200 bg-blue-100 p-3.5 rounded-xl shadow-inner relative'
                    >
                      {/* Reduced mb, pb */}
                      <h4 className='text-xl font-semibold text-blue-700 mb-3.5 border-b pb-2.5 border-blue-300'>
                        Número Adicional Involucrado {index + 1}
                      </h4>
                      <button
                        type='button'
                        onClick={() => handleRemoveAdditionalPhoneNumber(index)}
                        className='absolute top-4 right-4 px-3.5 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-md hover:bg-red-600 transition-colors duration-150'
                      >
                        Eliminar
                      </button>
                      {/* Reduced gap */}
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label
                            htmlFor={`additional-phone-${index}`}
                            className='block text-sm font-semibold text-gray-700 mb-1'
                          >
                            Número Telefónico:
                          </label>
                          <input
                            type='text'
                            id={`additional-phone-${index}`}
                            className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                            value={entry.phoneNumber}
                            onChange={(e) =>
                              handleAdditionalInputChange(
                                index,
                                "phoneNumber",
                                e.target.value
                              )
                            }
                            placeholder='Ej: +51 912345678'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`additional-imei-${index}`}
                            className='block text-sm font-semibold text-gray-700 mb-1'
                          >
                            IMEI:
                          </label>
                          <input
                            type='text'
                            id={`additional-imei-${index}`}
                            className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                            value={entry.imei}
                            onChange={(e) =>
                              handleAdditionalInputChange(
                                index,
                                "imei",
                                e.target.value
                              )
                            }
                            placeholder='Código IMEI (opcional)'
                          />
                        </div>
                        {/* Owner and DNI on the same row for additional entries */}
                        <div>
                          <label
                            htmlFor={`additional-owner-${index}`}
                            className='block text-sm font-semibold text-gray-700 mb-1'
                          >
                            Titular:
                          </label>
                          <input
                            type='text'
                            id={`additional-owner-${index}`}
                            className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                            value={entry.owner}
                            onChange={(e) =>
                              handleAdditionalInputChange(
                                index,
                                "owner",
                                e.target.value
                              )
                            }
                            placeholder='Nombre del titular'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`additional-dni-${index}`}
                            className='block text-sm font-semibold text-gray-700 mb-1'
                          >
                            DNI del Titular:
                          </label>
                          <input
                            type='text'
                            id={`additional-dni-${index}`}
                            className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                            value={entry.dni}
                            onChange={(e) =>
                              handleAdditionalInputChange(
                                index,
                                "dni",
                                e.target.value
                              )
                            }
                            placeholder='DNI del titular (opcional)'
                          />
                        </div>
                        {/* Finalidad field moved to the bottom for additional entries */}
                        <div>
                          <label
                            htmlFor={`additional-finalidad-${index}`}
                            className='block text-sm font-semibold text-gray-700 mb-1'
                          >
                            Finalidad:
                          </label>
                          <select
                            id={`additional-finalidad-${index}`}
                            className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out appearance-none bg-white pr-8'
                            value={entry.finalidad}
                            onChange={(e) =>
                              handleAdditionalInputChange(
                                index,
                                "finalidad",
                                e.target.value
                              )
                            }
                            required
                          >
                            <option value=''>Selecciona una Finalidad</option>
                            <option value='Comunicacion'>Comunicación</option>
                            <option value='Pago'>Pago</option>
                          </select>
                        </div>
                        {/* Link to show/hide custom user fields for additional entries */}
                        <div className='col-span-1 md:col-span-2 flex justify-end mt-1.5'>
                          <button
                            type='button'
                            onClick={() =>
                              handleAdditionalInputChange(
                                index,
                                "toggleCustomUserFields"
                              )
                            }
                            className='text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition duration-150 ease-in-out'
                          >
                            {entry.showCustomUserFields
                              ? "Ocultar opciones de usuario"
                              : "Mostrar más opciones de usuario"}
                          </button>
                        </div>
                        {/* Custom User and DNI conditionally rendered for additional entries */}
                        {entry.showCustomUserFields && (
                          <>
                            <div>
                              <label
                                htmlFor={`additional-customUser-${index}`}
                                className='block text-sm font-semibold text-gray-700 mb-1'
                              >
                                Usuario (Personalizado):
                              </label>
                              <input
                                type='text'
                                id={`additional-customUser-${index}`}
                                className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                                value={entry.customUser}
                                onChange={(e) =>
                                  handleAdditionalInputChange(
                                    index,
                                    "customUser",
                                    e.target.value
                                  )
                                }
                                placeholder='Ej: Nombre de usuario o ID'
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={`additional-customUserDni-${index}`}
                                className='block text-sm font-semibold text-gray-700 mb-1'
                              >
                                DNI de Usuario (Personalizado):
                              </label>
                              <input
                                type='text'
                                id={`additional-customUserDni-${index}`}
                                className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                                value={entry.customUserDni}
                                onChange={(e) =>
                                  handleAdditionalInputChange(
                                    index,
                                    "customUserDni",
                                    e.target.value
                                  )
                                }
                                placeholder='DNI del usuario personalizado (opcional)'
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sección 3: Datos del número contactado */}
                {/* Reduced padding */}
                <div className='border border-blue-300 bg-white rounded-xl p-4 shadow-lg'>
                  {/* Reduced mb, pb */}
                  <h3 className='text-2xl font-semibold text-blue-800 mb-4 border-b pb-3 border-blue-200'>
                    3) Datos del número contactado
                  </h3>
                  {/* Reduced gap */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label
                        htmlFor='secondaryPhoneNumber'
                        className='block text-sm font-semibold text-gray-700 mb-1'
                      >
                        Teléfono 02: {/* Changed label */}
                      </label>
                      <input
                        type='text'
                        id='secondaryPhoneNumber'
                        className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                        value={secondaryPhoneNumberInput}
                        onChange={(e) =>
                          setSecondaryPhoneNumberInput(e.target.value)
                        }
                        placeholder='Ej: +51 912345678 (opcional)'
                      />
                    </div>
                    <div>
                      <label
                        htmlFor='secondaryOwner'
                        className='block text-sm font-semibold text-gray-700 mb-1'
                      >
                        Titular (Número 02):
                      </label>
                      <input
                        type='text'
                        id='secondaryOwner'
                        className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                        value={secondaryOwnerInput}
                        onChange={(e) => setSecondaryOwnerInput(e.target.value)}
                        placeholder='Nombre del titular (Número 02)'
                      />
                    </div>
                    <div className='col-span-1 md:col-span-2'>
                      <label
                        htmlFor='secondaryDni'
                        className='block text-sm font-semibold text-gray-700 mb-1'
                      >
                        DNI del Titular (Número 02):
                      </label>
                      <input
                        type='text'
                        id='secondaryDni'
                        className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                        value={secondaryDniInput}
                        onChange={(e) => setSecondaryDniInput(e.target.value)}
                        placeholder='DNI del titular (Número 02, opcional)'
                      />
                    </div>
                  </div>

                  {/* Add New Contact Phone Number Button (for section 3) */}
                  {/* Reduced mt, pt */}
                  <div className='mt-5 border-t pt-3.5 border-blue-200'>
                    <button
                      type='button'
                      onClick={handleAddAdditionalContactPhoneNumber}
                      className='flex items-center justify-center px-5 py-2.5 border border-dashed border-blue-400 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition duration-200 ease-in-out'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-6 w-6 mr-2'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                          clipRule='evenodd'
                        />
                      </svg>
                      Agregar otro número de contacto
                    </button>
                  </div>

                  {/* Dynamically Added Contact Phone Number Fields (for section 3) */}
                  {additionalContactPhoneEntries.map((entry, index) => (
                    // Reduced mt, pt, padding
                    <div
                      key={index}
                      className='mt-6 pt-4 border-t border-blue-200 bg-blue-100 p-3.5 rounded-xl shadow-inner relative'
                    >
                      {/* Reduced mb, pb */}
                      <h4 className='text-xl font-semibold text-blue-700 mb-3.5 border-b pb-2.5 border-blue-300'>
                        Número de Contacto Adicional {index + 1}
                      </h4>
                      <button
                        type='button'
                        onClick={() =>
                          handleRemoveAdditionalContactPhoneNumber(index)
                        }
                        className='absolute top-4 right-4 px-3.5 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-md hover:bg-red-600 transition-colors duration-150'
                      >
                        Eliminar
                      </button>
                      {/* Reduced gap */}
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label
                            htmlFor={`additional-contact-phone-${index}`}
                            className='block text-sm font-semibold text-gray-700 mb-1'
                          >
                            Número Telefónico:
                          </label>
                          <input
                            type='text'
                            id={`additional-contact-phone-${index}`}
                            className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                            value={entry.phoneNumber}
                            onChange={(e) =>
                              handleAdditionalContactInputChange(
                                index,
                                "phoneNumber",
                                e.target.value
                              )
                            }
                            placeholder='Ej: +51 912345678'
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`additional-contact-owner-${index}`}
                            className='block text-sm font-semibold text-gray-700 mb-1'
                          >
                            Titular:
                          </label>
                          <input
                            type='text'
                            id={`additional-contact-owner-${index}`}
                            className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                            value={entry.owner}
                            onChange={(e) =>
                              handleAdditionalContactInputChange(
                                index,
                                "owner",
                                e.target.value
                              )
                            }
                            placeholder='Nombre del titular'
                          />
                        </div>
                        <div className='col-span-1 md:col-span-2'>
                          <label
                            htmlFor={`additional-contact-dni-${index}`}
                            className='block text-sm font-semibold text-gray-700 mb-1'
                          >
                            DNI del Titular:
                          </label>
                          <input
                            type='text'
                            id={`additional-contact-dni-${index}`}
                            className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                            value={entry.dni}
                            onChange={(e) =>
                              handleAdditionalContactInputChange(
                                index,
                                "dni",
                                e.target.value
                              )
                            }
                            placeholder='DNI del titular (opcional)'
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sección 4: Otros Datos para mapeo */}
                {/* Reduced padding */}
                <div className='border border-blue-300 bg-white rounded-xl p-4 shadow-lg'>
                  {/* Reduced mb, pb */}
                  <h3 className='text-2xl font-semibold text-blue-800 mb-4 border-b pb-3 border-blue-200'>
                    4) Otros Datos para mapeo
                  </h3>
                  {/* Reduced gap */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* Celda Activa (Dirección) */}
                    <div className='md:col-span-2'>
                      <label
                        htmlFor='celdaActiva'
                        className='block text-sm font-semibold text-gray-700 mb-1'
                      >
                        Celda Activa (Dirección):
                      </label>
                      <input
                        type='text'
                        id='celdaActiva'
                        className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                        value={celdaActivaInput}
                        onChange={(e) => setCeldaActivaInput(e.target.value)}
                        placeholder='Ej: Av. Salaverry 123, Lima'
                      />
                    </div>

                    {/* Departamento, Provincia y Distrito */}
                    <div>
                      <label
                        htmlFor='departamento'
                        className='block text-sm font-semibold text-gray-700 mb-1'
                      >
                        Departamento:
                      </label>
                      <select
                        id='departamento'
                        className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out appearance-none bg-white pr-8'
                        value={departamentoInput}
                        onChange={(e) => setDepartamentoInput(e.target.value)}
                        required
                      >
                        <option value=''>Selecciona un Departamento</option>
                        {Object.keys(peruGeoData)
                          .sort()
                          .map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor='provincia'
                        className='block text-sm font-semibold text-gray-700 mb-1'
                      >
                        Provincia:
                      </label>
                      <select
                        id='provincia'
                        className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out appearance-none bg-white pr-8'
                        value={provinciaInput}
                        onChange={(e) => setProvinciaInput(e.target.value)}
                        disabled={!departamentoInput}
                        required
                      >
                        <option value=''>Selecciona una Provincia</option>
                        {departamentoInput &&
                          peruGeoData[departamentoInput] &&
                          Object.keys(peruGeoData[departamentoInput])
                            .sort()
                            .map((prov) => (
                              <option key={prov} value={prov}>
                                {prov}
                              </option>
                            ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor='distrito'
                        className='block text-sm font-semibold text-gray-700 mb-1'
                      >
                        Distrito:
                      </label>
                      <select
                        id='distrito'
                        className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out appearance-none bg-white pr-8'
                        value={distritoInput}
                        onChange={(e) => setDistritoInput(e.target.value)}
                        disabled={!provinciaInput}
                        required
                      >
                        <option value=''>Selecciona un Distrito</option>
                        {departamentoInput &&
                          provinciaInput &&
                          peruGeoData[departamentoInput] &&
                          peruGeoData[departamentoInput][provinciaInput] &&
                          peruGeoData[departamentoInput][provinciaInput]
                            .sort()
                            .map((dist) => (
                              <option key={dist} value={dist}>
                                {dist}
                              </option>
                            ))}
                      </select>
                    </div>
                    <div className='col-span-1 md:col-span-2'>
                      <label
                        htmlFor='file-upload'
                        className='block text-sm font-semibold text-gray-700 mb-1'
                      >
                        Adjuntar Archivo:
                      </label>
                      <input
                        type='file'
                        id='file-upload'
                        accept='.csv'
                        className='mt-1 block w-full text-base text-gray-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-base file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors duration-150 cursor-pointer'
                        onChange={handleFileChange}
                      />
                      {selectedFile && (
                        <p className='text-sm text-gray-600 mt-1.5'>
                          Archivo seleccionado:{" "}
                          <span className='font-medium text-blue-700'>
                            {selectedFile.name}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type='submit'
                  className='w-full inline-flex justify-center py-3.5 px-4 border border-transparent shadow-md text-lg font-bold rounded-lg text-white bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed'
                  disabled={uploading}
                >
                  {uploading ? "Subiendo archivo..." : "Añadir Registro"}
                </button>
              </form>
              {batchUploadStatus && !uploading && (
                <p
                  className={`text-sm mt-4 text-center ${
                    batchUploadStatus.includes("Error")
                      ? "text-red-600"
                      : batchUploadStatus.includes("exitosamente")
                      ? "text-green-600"
                      : "text-blue-600"
                  } font-medium`}
                >
                  {batchUploadStatus}
                </p>
              )}
            </section>

            {/* Resumen de Datos */}
            {/* Reduced padding */}
            <section className='bg-white p-5 rounded-2xl shadow-xl border border-gray-200'>
              {/* Reduced mb */}
              <h2 className='text-3xl font-bold text-gray-800 mb-5 text-center'>
                Resumen de Registros
              </h2>
              {/* Reduced gap */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-center'>
                {/* Reduced padding */}
                <div className='bg-indigo-50 p-4 rounded-xl shadow-md border border-indigo-200'>
                  <p className='text-lg text-indigo-700 font-semibold'>
                    Total de Registros
                  </p>
                  <p className='text-5xl font-extrabold text-indigo-900 mt-2.5'>
                    {totalEntries}
                  </p>
                </div>
                <div className='bg-sky-50 p-4 rounded-xl shadow-md border border-sky-200'>
                  {/* Reduced mb */}
                  <h3 className='text-xl font-bold text-sky-800 mb-3'>
                    Registros por Usuario:
                  </h3>
                  <ul className='list-disc list-inside text-sky-700 space-y-1.5'>
                    {Object.entries(entriesByUser).map(([user, count]) => (
                      <li
                        key={user}
                        className='flex justify-between items-center text-base'
                      >
                        <span className='font-semibold text-sky-900'>
                          {user.substring(0, 8)}...:
                        </span>{" "}
                        <span className='font-bold text-lg'>{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Últimos Registros */}
            {/* Reduced padding */}
            <section className='bg-white p-5 rounded-2xl shadow-xl border border-gray-200'>
              {/* Reduced mb */}
              <div className='flex flex-col md:flex-row justify-between items-center mb-5'>
                {/* Reduced mb */}
                <h2 className='text-3xl font-bold text-gray-800 text-center md:text-left mb-3 md:mb-0'>
                  Últimos Registros
                </h2>
                <button
                  onClick={() => exportToExcel(data, "registros_telefónicos")}
                  className='px-6 py-3 bg-gradient-to-r from-teal-500 to-green-600 text-white text-base font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 transition duration-200 ease-in-out'
                >
                  Exportar Todo a Excel
                </button>
              </div>
              {data.length === 0 ? (
                <p className='text-gray-500 text-center text-lg py-6'>
                  Aún no hay registros telefónicos. ¡Sé el primero en añadir
                  uno!
                </p>
              ) : (
                // Reduced gap
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {data.map((item) => (
                    // Reduced padding
                    <div
                      key={item.id}
                      className='bg-blue-50 p-4 rounded-xl shadow-md border border-blue-200 hover:shadow-lg transition duration-200 ease-in-out'
                    >
                      {/* Reduced space-y, mb */}
                      <div className='space-y-0.5 text-sm text-gray-700 mb-3'>
                        <p>
                          <span className='font-semibold text-gray-800'>
                            Carpeta Fiscal:
                          </span>{" "}
                          {item.carpetaFiscal || "N/A"}
                        </p>
                        <p>
                          <span className='font-semibold text-gray-800'>
                            Despacho:
                          </span>{" "}
                          {item.despacho || "N/A"}
                        </p>
                        <p>
                          <span className='font-semibold text-gray-800'>
                            Número 01:
                          </span>{" "}
                          {item.phoneNumber}
                        </p>
                        <p>
                          <span className='font-semibold text-gray-800'>
                            IMEI:
                          </span>{" "}
                          {item.imei || "N/A"}
                        </p>
                        <p>
                          <span className='font-semibold text-gray-800'>
                            Finalidad:
                          </span>{" "}
                          {item.finalidad || "N/A"}
                        </p>
                        <p>
                          <span className='font-semibold text-gray-800'>
                            Titular:
                          </span>{" "}
                          {item.owner || "N/A"}
                        </p>
                        <p>
                          <span className='font-semibold text-gray-800'>
                            DNI Titular:
                          </span>{" "}
                          {item.dni || "N/A"}
                        </p>
                        {/* Now display custom user and DNI here */}
                        <p>
                          <span className='font-semibold text-gray-800'>
                            Usuario (Personalizado):
                          </span>{" "}
                          {item.customUser || "N/A"}
                        </p>
                        <p>
                          <span className='font-semibold text-gray-800'>
                            DNI Usuario (Personalizado):
                          </span>{" "}
                          {item.customUserDni || "N/A"}
                        </p>
                        <p>
                          <span className='font-semibold text-gray-800'>
                            Teléfono 02:
                          </span>{" "}
                          {item.secondaryPhoneNumber || "N/A"}
                        </p>
                        <p>
                          <span className='font-semibold text-gray-800'>
                            Titular 02:
                          </span>{" "}
                          {item.secondaryOwner || "N/A"}
                        </p>
                        <p>
                          <span className='font-semibold text-gray-800'>
                            DNI Titular 02:
                          </span>{" "}
                          {item.secondaryDni || "N/A"}
                        </p>
                        {/* Display additional involved phone entries */}
                        {(item.additionalPhoneEntries || []).map(
                          (entry, idx) => (
                            // Reduced mt, pl
                            <div
                              key={`involved-add-${idx}`}
                              className='mt-1.5 pl-2.5 border-l-2 border-blue-300'
                            >
                              <p>
                                <span className='font-semibold text-gray-800'>
                                  Add. Num. {idx + 1}:
                                </span>{" "}
                                {entry.phoneNumber || "N/A"}
                              </p>
                              <p>
                                <span className='font-semibold text-gray-800'>
                                  Add. Titular {idx + 1}:
                                </span>{" "}
                                {entry.owner || "N/A"}
                              </p>
                              <p>
                                <span className='font-semibold text-gray-800'>
                                  Add. DNI Titular {idx + 1}:
                                </span>{" "}
                                {entry.dni || "N/A"}
                              </p>
                              <p>
                                <span className='font-semibold text-gray-800'>
                                  Add. Usuario {idx + 1}:
                                </span>{" "}
                                {entry.customUser || "N/A"}
                              </p>
                              <p>
                                <span className='font-semibold text-gray-800'>
                                  Add. DNI Usuario {idx + 1}:
                                </span>{" "}
                                {entry.customUserDni || "N/A"}
                              </p>
                            </div>
                          )
                        )}
                        {/* Display additional contact phone entries */}
                        {(item.additionalContactPhoneEntries || []).map(
                          (entry, idx) => (
                            // Reduced mt, pl
                            <div
                              key={`contact-add-${idx}`}
                              className='mt-1.5 pl-2.5 border-l-2 border-purple-300'
                            >
                              <p>
                                <span className='font-semibold text-gray-800'>
                                  Contact. Num. {idx + 1}:
                                </span>{" "}
                                {entry.phoneNumber || "N/A"}
                              </p>
                              <p>
                                <span className='font-semibold text-gray-800'>
                                  Contact. Titular {idx + 1}:
                                </span>{" "}
                                {entry.owner || "N/A"}
                              </p>
                              <p>
                                <span className='font-semibold text-gray-800'>
                                  Contact. DNI Titular {idx + 1}:
                                </span>{" "}
                                {entry.dni || "N/A"}
                              </p>
                            </div>
                          )
                        )}
                        {/* Celda Activa and Geo data remain in section 4 (display only) */}
                        <p className='flex items-center'>
                          <span className='font-semibold text-gray-800'>
                            Celda Activa:
                          </span>{" "}
                          {item.celdaActiva || "N/A"}
                        </p>
                        <p>
                          <span className='font-semibold text-gray-800'>
                            Departamento:
                          </span>{" "}
                          {item.departamento || "N/A"}
                        </p>
                        <p>
                          <span className='font-semibold text-gray-800'>
                            Provincia:
                          </span>{" "}
                          {item.provincia || "N/A"}
                        </p>
                        <p>
                          <span className='font-semibold text-gray-800'>
                            Distrito:
                          </span>{" "}
                          {item.distrito || "N/A"}
                        </p>
                      </div>
                      {item.fileUrl && (
                        // Reduced mb
                        <p className='text-sm text-gray-700 mb-2'>
                          <span className='font-semibold text-gray-800'>
                            Archivo:
                          </span>{" "}
                          <a
                            href={item.fileUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-150'
                          >
                            {item.fileName || "Ver Archivo"}
                          </a>
                        </p>
                      )}
                      <div className='border-t border-gray-200 pt-2 text-xs text-gray-500'>
                        <p>
                          <span className='font-semibold'>
                            Ingresado Por (ID):
                          </span>{" "}
                          {item.enteredBy.substring(0, 8)}...
                        </p>
                        <p>
                          <span className='font-semibold'>Fecha:</span>{" "}
                          {item.timestamp?.toDate().toLocaleString() || "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Vista de CONSULTA (Simplificada) */}
        {viewMode === "consulta_simplificada" && (
          // Reduced padding
          <section className='bg-white p-5 rounded-2xl shadow-xl border border-gray-200'>
            {/* Reduced mb */}
            <div className='flex flex-col md:flex-row justify-between items-center mb-5'>
              {/* Reduced mb */}
              <h2 className='text-3xl font-bold text-gray-800 text-center md:text-left mb-3 md:mb-0'>
                Consultar Registros
              </h2>
              <div className='flex space-x-3'>
                <button
                  onClick={() => setViewMode("initial")}
                  className='px-6 py-3 bg-gray-700 text-white text-base font-medium rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 transition duration-200 ease-in-out transform hover:scale-105'
                >
                  ← Volver al Inicio
                </button>
                <button
                  onClick={() => setViewMode("graph_view")}
                  className='px-6 py-3 bg-gradient-to-r from-purple-700 to-indigo-800 text-white text-base font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200 ease-in-out'
                >
                  Ver Gráfico
                </button>
              </div>
            </div>

            {/* Filtros de Búsqueda Simplificados */}
            {/* Reduced gap, mb, padding */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 bg-blue-50 p-4 rounded-xl shadow-inner border border-blue-100'>
              <div>
                <label
                  htmlFor='searchCriteria'
                  className='block text-sm font-semibold text-gray-700 mb-1'
                >
                  Buscar por:
                </label>
                <select
                  id='searchCriteria'
                  className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out appearance-none bg-white pr-8'
                  value={searchCriteria}
                  onChange={(e) => {
                    setSearchCriteria(e.target.value);
                    setSearchValue("");
                  }}
                >
                  <option value='phoneNumber'>Número Telefónico 01</option>
                  <option value='secondaryPhoneNumber'>Teléfono 02</option>
                  <option value='owner'>Titular (Número 01)</option>
                  <option value='dni'>DNI Titular (Número 01)</option>
                  <option value='customUser'>Usuario (Personalizado) 01</option>
                  <option value='customUserDni'>
                    DNI Usuario (Personalizado) 01
                  </option>
                  <option value='additionalPhoneNumbers'>
                    Números Involucrados Adicionales (Búsqueda General)
                  </option>
                  <option value='additionalContactPhoneNumbers'>
                    Números Contactados Adicionales (Búsqueda General)
                  </option>
                </select>
              </div>
              <div>
                <label
                  htmlFor='searchValue'
                  className='block text-sm font-semibold text-gray-700 mb-1'
                >
                  Valor a buscar:
                </label>
                <input
                  type='text'
                  id='searchValue'
                  className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-150 ease-in-out'
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder='Introduce el valor'
                />
              </div>
            </div>

            {/* Reduced mb */}
            <div className='flex justify-end space-x-4 mb-5'>
              <button
                onClick={resetSimplifiedSearch}
                className='px-6 py-3 bg-gray-600 text-white text-base font-medium rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200 ease-in-out'
              >
                Limpiar Búsqueda
              </button>
              <button
                onClick={handleSimplifiedSearch}
                className='px-6 py-3 bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-base font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition duration-200 ease-in-out'
              >
                Buscar
              </button>
            </div>

            {/* Resultados de la Búsqueda - VISUALIZACIÓN A TODO EL ANCHO */}
            {/* Reduced mb */}
            <h3 className='text-2xl font-bold text-gray-800 mb-3 text-center'>
              Resultados de la Búsqueda ({filteredResults.length})
            </h3>
            {filteredResults.length === 0 && searchValue.trim() !== "" ? (
              <p className='text-gray-500 text-center text-lg py-7'>
                No se encontraron registros que coincidan con los criterios de
                búsqueda.
              </p>
            ) : filteredResults.length === 0 && searchValue.trim() === "" ? (
              <p className='text-gray-500 text-center text-lg py-7'>
                Utiliza los filtros de búsqueda para encontrar registros.
              </p>
            ) : (
              <div className='overflow-x-auto rounded-xl shadow-lg border border-gray-200'>
                <table className='min-w-full bg-white'>
                  <thead className='bg-blue-100 border-b border-blue-200'>
                    <tr>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-blue-700 uppercase tracking-wider'>
                        Carpeta Fiscal
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-blue-700 uppercase tracking-wider'>
                        Despacho Fiscal
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-blue-700 uppercase tracking-wider'>
                        Titular
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-blue-700 uppercase tracking-wider'>
                        Usuario
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-blue-700 uppercase tracking-wider'>
                        Teléfono 02
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-blue-700 uppercase tracking-wider'>
                        Fecha
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-blue-700 uppercase tracking-wider'>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {filteredResults.map((item) => {
                      // Logic to format Carpeta Fiscal
                      let formattedCarpetaFiscal = "N/A";
                      if (
                        item.carpetaFiscal &&
                        item.carpetaFiscal.startsWith("Carpeta-")
                      ) {
                        const parts = item.carpetaFiscal.split("-"); // e.g., ["Carpeta", "2024", "1"]
                        if (parts.length === 3) {
                          const year = parts[1];
                          const number = parseInt(parts[2], 10);
                          formattedCarpetaFiscal = `${String(number).padStart(
                            2,
                            "0"
                          )} - ${year}`;
                        } else {
                          formattedCarpetaFiscal = item.carpetaFiscal; // Fallback if format doesn't match
                        }
                      } else {
                        formattedCarpetaFiscal = item.carpetaFiscal || "N/A";
                      }

                      return (
                        <tr
                          key={item.id}
                          className='hover:bg-blue-50 transition-colors duration-150'
                        >
                          <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-800'>
                            {formattedCarpetaFiscal}
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-800'>
                            {item.despacho
                              ? item.despacho.split(" ")[0]
                              : "N/A"}
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-800'>
                            {item.owner || "N/A"}
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-800'>
                            {item.customUser || "N/A"}
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-800'>
                            {item.secondaryPhoneNumber || "N/A"}
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-800'>
                            {item.timestamp?.toDate().toLocaleDateString() ||
                              "N/A"}
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-sm font-medium'>
                            <button
                              onClick={() => {
                                setSelectedRecordDetails(item);
                                setShowDetailModal(true);
                              }}
                              className='text-blue-600 hover:text-blue-900 transition-colors duration-150 text-xs bg-blue-100 px-3.5 py-1.5 rounded-md hover:bg-blue-200 shadow-sm'
                            >
                              Más Detalle
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {/* Botón Exportar a Excel para resultados filtrados */}
            <div className='mt-6 text-right'>
              <button
                onClick={() =>
                  exportToExcel(filteredResults, "resultados_consulta")
                }
                className='px-6 py-3 bg-gradient-to-r from-teal-500 to-green-600 text-white text-base font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 transition duration-200 ease-in-out'
              >
                Exportar Resultados a Excel
              </button>
            </div>
          </section>
        )}

        {/* Modal de Más Detalle */}
        {showDetailModal && selectedRecordDetails && (
          <div className='fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in'>
            {/* Reduced padding */}
            <div className='bg-white rounded-2xl shadow-3xl p-7 m-4 max-w-3xl w-full border-t-5 border-blue-600 transform scale-100 animate-scale-in max-h-[90vh] overflow-y-auto'>
              {/* Reduced mb, pb */}
              <h3 className='text-3xl font-bold text-gray-800 mb-5 text-center border-b pb-3 border-blue-200'>
                Detalles del Registro
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-lg'>
                <p>
                  <span className='font-semibold text-gray-900'>
                    Carpeta Fiscal:
                  </span>{" "}
                  {selectedRecordDetails.carpetaFiscal || "N/A"}
                </p>
                <p>
                  <span className='font-semibold text-gray-900'>Despacho:</span>{" "}
                  {selectedRecordDetails.despacho || "N/A"}
                </p>

                {/* Primary Phone Number Details */}
                {/* Reduced pt, mt, padding */}
                <div className='md:col-span-2 border-t border-blue-100 pt-3.5 mt-3.5 bg-blue-50 p-3 rounded-lg shadow-sm'>
                  {/* Reduced mb */}
                  <h4 className='text-xl font-semibold text-blue-800 mb-2'>
                    Número Principal Involucrado:
                  </h4>
                  <p>
                    <span className='font-semibold text-gray-900'>
                      Número Telefónico 01:
                    </span>{" "}
                    {selectedRecordDetails.phoneNumber || "N/A"}
                  </p>
                  <p>
                    <span className='font-semibold text-gray-900'>IMEI:</span>{" "}
                    {selectedRecordDetails.imei || "N/A"}
                  </p>
                  <p>
                    <span className='font-semibold text-gray-900'>
                      Finalidad:
                    </span>{" "}
                    {selectedRecordDetails.finalidad || "N/A"}
                  </p>
                  <p>
                    <span className='font-semibold text-gray-900'>
                      Titular:
                    </span>{" "}
                    {selectedRecordDetails.owner || "N/A"}
                  </p>
                  <p>
                    <span className='font-semibold text-gray-900'>
                      DNI Titular:
                    </span>{" "}
                    {selectedRecordDetails.dni || "N/A"}
                  </p>
                  <p>
                    <span className='font-semibold text-gray-900'>
                      Usuario (Personalizado):
                    </span>{" "}
                    {selectedRecordDetails.customUser || "N/A"}
                  </p>
                  <p>
                    <span className='font-semibold text-gray-900'>
                      DNI Usuario (Personalizado):
                    </span>{" "}
                    {selectedRecordDetails.customUserDni || "N/A"}
                  </p>
                </div>

                {/* Additional Phone Entries (section 2) */}
                {(selectedRecordDetails.additionalPhoneEntries || []).map(
                  (entry, index) => (
                    // Reduced pt, mt, padding
                    <div
                      key={index}
                      className='md:col-span-2 border-t border-blue-100 pt-3.5 mt-3.5 bg-blue-50 p-3 rounded-lg shadow-sm'
                    >
                      {/* Reduced mb */}
                      <h4 className='text-xl font-semibold text-blue-800 mb-2'>
                        Número Involucrado Adicional {index + 1}:
                      </h4>
                      <p>
                        <span className='font-semibold text-gray-900'>
                          Número Telefónico:
                        </span>{" "}
                        {entry.phoneNumber || "N/A"}
                      </p>
                      <p>
                        <span className='font-semibold text-gray-900'>
                          IMEI:
                        </span>{" "}
                        {entry.imei || "N/A"}
                      </p>
                      <p>
                        <span className='font-semibold text-gray-900'>
                          Finalidad:
                        </span>{" "}
                        {entry.finalidad || "N/A"}
                      </p>
                      <p>
                        <span className='font-semibold text-gray-900'>
                          Titular:
                        </span>{" "}
                        {entry.owner || "N/A"}
                      </p>
                      <p>
                        <span className='font-semibold text-gray-900'>
                          DNI Titular:
                        </span>{" "}
                        {entry.dni || "N/A"}
                      </p>
                      <p>
                        <span className='font-semibold text-gray-900'>
                          Usuario (Personalizado):
                        </span>{" "}
                        {entry.customUser || "N/A"}
                      </p>
                      <p>
                        <span className='font-semibold text-gray-900'>
                          DNI Usuario (Personalizado):
                        </span>{" "}
                        {entry.customUserDni || "N/A"}
                      </p>
                    </div>
                  )
                )}

                {/* Secondary Phone Number (now part of Datos del número contactado) */}
                {/* Reduced pt, mt, padding */}
                <div className='md:col-span-2 border-t border-blue-100 pt-3.5 mt-3.5 bg-blue-50 p-3 rounded-lg shadow-sm'>
                  {/* Reduced mb */}
                  <h4 className='text-xl font-semibold text-blue-800 mb-2'>
                    Número Contactado Principal:
                  </h4>
                  <p>
                    <span className='font-semibold text-gray-900'>
                      Teléfono 02:
                    </span>{" "}
                    {selectedRecordDetails.secondaryPhoneNumber || "N/A"}
                  </p>
                  <p>
                    <span className='font-semibold text-gray-900'>
                      Titular (Número 02):
                    </span>{" "}
                    {selectedRecordDetails.secondaryOwner || "N/A"}
                  </p>
                  <p>
                    <span className='font-semibold text-gray-900'>
                      DNI Titular (Número 02):
                    </span>{" "}
                    {selectedRecordDetails.secondaryDni || "N/A"}
                  </p>
                </div>

                {/* Additional Contact Phone Entries (section 3) */}
                {(
                  selectedRecordDetails.additionalContactPhoneEntries || []
                ).map((entry, index) => (
                  // Reduced pt, mt, padding
                  <div
                    key={index}
                    className='md:col-span-2 border-t border-blue-100 pt-3.5 mt-3.5 bg-blue-50 p-3 rounded-lg shadow-sm'
                  >
                    {/* Reduced mb */}
                    <h4 className='text-xl font-semibold text-blue-800 mb-2'>
                      Número Contactado Adicional {index + 1}:
                    </h4>
                    <p>
                      <span className='font-semibold text-gray-900'>
                        Número Telefónico:
                      </span>{" "}
                      {entry.phoneNumber || "N/A"}
                    </p>
                    <p>
                      <span className='font-semibold text-gray-900'>
                        Titular:
                      </span>{" "}
                      {entry.owner || "N/A"}
                    </p>
                    <p>
                      <span className='font-semibold text-gray-900'>
                        DNI Titular:
                      </span>{" "}
                      {entry.dni || "N/A"}
                    </p>
                  </div>
                ))}

                {/* Other Additional Data (now section 4) */}
                {/* Reduced pt, mt, padding */}
                <div className='md:col-span-2 border-t border-blue-100 pt-3.5 mt-3.5 bg-blue-50 p-3 rounded-lg shadow-sm'>
                  {/* Reduced mb */}
                  <h4 className='text-xl font-semibold text-blue-800 mb-2'>
                    Otros Datos para Mapeo:
                  </h4>
                  {/* Celda Activa with inline map button */}
                  <div className='flex items-center space-x-2'>
                    <p>
                      <span className='font-semibold text-gray-900'>
                        Celda Activa (Dirección):
                      </span>{" "}
                      {selectedRecordDetails.celdaActiva || "N/A"}
                    </p>
                    {selectedRecordDetails.celdaActiva &&
                      selectedRecordDetails.celdaActiva.trim() !== "" && (
                        <button
                          onClick={() =>
                            openGoogleMaps([selectedRecordDetails.celdaActiva])
                          }
                          className='px-3.5 py-1.5 bg-green-600 text-white text-sm font-bold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out'
                          title='Ver Celda Activa en Google Maps'
                        >
                          Ver Mapa
                        </button>
                      )}
                  </div>
                  <p>
                    <span className='font-semibold text-gray-900'>
                      Departamento:
                    </span>{" "}
                    {selectedRecordDetails.departamento || "N/A"}
                  </p>
                  <p>
                    <span className='font-semibold text-gray-900'>
                      Provincia:
                    </span>{" "}
                    {selectedRecordDetails.provincia || "N/A"}
                  </p>
                  <p>
                    <span className='font-semibold text-gray-900'>
                      Distrito:
                    </span>{" "}
                    {selectedRecordDetails.distrito || "N/A"}
                  </p>
                </div>

                {selectedRecordDetails.fileUrl && (
                  // Reduced pt, mt, padding
                  <p className='md:col-span-2 border-t border-blue-100 pt-3.5 mt-3.5 bg-blue-50 p-3 rounded-lg shadow-sm'>
                    <span className='font-semibold text-gray-900'>
                      Archivo Adjunto:
                    </span>{" "}
                    <a
                      href={selectedRecordDetails.fileUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-150'
                    >
                      {selectedRecordDetails.fileName || "Ver Archivo"}
                    </a>
                  </p>
                )}
                <p>
                  <span className='font-semibold text-gray-900'>
                    Ingresado Por (ID):
                  </span>{" "}
                  {selectedRecordDetails.enteredBy?.substring(0, 8)}...
                </p>
                <p>
                  <span className='font-semibold text-gray-900'>
                    Fecha de Ingreso:
                  </span>{" "}
                  {selectedRecordDetails.timestamp?.toDate().toLocaleString() ||
                    "N/A"}
                </p>
              </div>
              {/* Reduced mt */}
              <div className='mt-6 text-center'>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className='px-9 py-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-lg font-bold rounded-lg shadow-md hover:from-blue-800 hover:to-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition duration-200 ease-in-out transform hover:scale-105'
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vista de CARGA MASIVA */}
        {viewMode === "carga_masiva" && (
          // Reduced padding
          <section className='bg-white p-5 rounded-2xl shadow-xl border border-gray-200'>
            {/* Reduced mb */}
            <div className='flex justify-between items-center mb-5'>
              <h2 className='text-3xl font-bold text-gray-800 text-center'>
                Carga Masiva de Registros (CSV)
              </h2>
              <button
                onClick={() => setViewMode("registro")}
                className='px-6 py-3 bg-gray-700 text-white text-base font-medium rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 transition duration-200 ease-in-out transform hover:scale-105'
              >
                ← Volver a Registro
              </button>
            </div>

            {/* Reduced padding, mb */}
            <div className='bg-blue-50 p-4 rounded-xl mb-5 shadow-inner border border-blue-100'>
              {/* Reduced mb */}
              <p className='text-gray-700 mb-3 text-lg font-medium'>
                Para la carga masiva, sube un archivo CSV con los siguientes
                encabezados (en la primera fila). Si incluyes números
                involucrados adicionales o números contactados adicionales, el
                patrón de encabezados se repetirá.
              </p>
              {/* Reduced padding */}
              <code className='block bg-blue-100 p-3 rounded-md text-sm text-blue-800 break-words font-mono shadow-sm border border-blue-200'>
                phoneNumber,imei,finalidad,owner,dni,customUser,customUserDni,secondaryPhoneNumber,secondaryOwner,secondaryDni,carpetaFiscal,despacho,celdaActiva,departamento,provincia,distrito,
                <br />
                Número Adicional 1,IMEI Adicional 1,Finalidad Adicional
                1,Titular Adicional 1,DNI Titular Adicional 1,Usuario
                Personalizado Adicional 1,DNI Usuario Personalizado Adicional
                1,...,
                <br />
                Número Contactado Adicional 1,Titular Contactado Adicional 1,DNI
                Contactado Adicional 1,...
              </code>
              {/* Reduced mt */}
              <p className='text-gray-600 mt-2 text-xs'>
                Puedes usar comas (`,`) o puntos y comas (`;`) como separador.
                Asegúrate de que los campos `phoneNumber`, `despacho`,
                `finalidad`, `departamento`, `provincia` y `distrito` estén
                presentes y sean válidos.
              </p>
            </div>

            {/* Reduced space-y */}
            <div className='space-y-5'>
              <div>
                <label
                  htmlFor='csv-upload'
                  className='block text-sm font-semibold text-gray-700 mb-1'
                >
                  Seleccionar archivo CSV:
                </label>
                <input
                  type='file'
                  id='csv-upload'
                  accept='.csv'
                  className='mt-1 block w-full text-base text-gray-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-base file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors duration-150 cursor-pointer'
                  onChange={handleCsvFileChange}
                />
                {csvFile && (
                  <p className='text-base text-gray-700 mt-1.5'>
                    Archivo seleccionado:{" "}
                    <span className='font-medium text-blue-700'>
                      {csvFile.name}
                    </span>
                  </p>
                )}
              </div>
              <button
                onClick={handleBatchCsvUpload}
                className='w-full inline-flex justify-center py-3.5 px-4 border border-transparent shadow-md text-lg font-bold rounded-lg text-white bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed'
                disabled={batchUploading || !csvFile}
              >
                {batchUploading
                  ? "Cargando registros..."
                  : "Iniciar Carga Masiva"}
              </button>
              {batchUploadStatus && (
                <p
                  className={`text-base mt-4 text-center ${
                    batchUploadStatus.includes("Error")
                      ? "text-red-600"
                      : batchUploadStatus.includes("Éxitos")
                      ? "text-green-600"
                      : "text-blue-600"
                  } font-medium`}
                >
                  {batchUploadStatus}
                </p>
              )}
            </div>
          </section>
        )}

        {/* New Graph View */}
        {viewMode === "graph_view" && (
          // Reduced padding
          <section className='bg-white p-5 rounded-2xl shadow-xl border border-gray-200'>
            {/* Reduced mb */}
            <div className='flex justify-between items-center mb-5'>
              <h2 className='text-3xl font-bold text-gray-800 text-center'>
                Visualización de Datos
              </h2>
              <button
                onClick={() => setViewMode("consulta_simplificada")}
                className='px-6 py-3 bg-gray-700 text-white text-base font-medium rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 transition duration-200 ease-in-out transform hover:scale-105'
              >
                ← Volver a Consulta
              </button>
            </div>

            {/* Chart 1: Entries per Despacho */}
            {/* Reduced mb */}
            <div className='mb-7'>
              {/* Reduced mb */}
              <h3 className='text-2xl font-bold text-gray-800 mb-4 text-center'>
                Registros por Despacho
              </h3>
              {data.length === 0 ? (
                // Reduced py
                <p className='text-gray-500 text-center text-lg py-6'>
                  No hay datos para generar el gráfico de despachos.
                </p>
              ) : (
                <div
                  /* Reduced padding */ className='flex flex-wrap justify-center items-end bg-blue-50 p-5 rounded-xl min-h-[280px] overflow-x-auto border border-blue-100 shadow-inner'
                >
                  {(() => {
                    const despachoCounts = data.reduce((acc, item) => {
                      const despacho = item.despacho || "Sin Despacho";
                      acc[despacho] = (acc[despacho] || 0) + 1;
                      return acc;
                    }, {});

                    const maxCount = Math.max(
                      ...Object.values(despachoCounts),
                      1
                    );

                    return Object.entries(despachoCounts)
                      .sort()
                      .map(([despacho, count]) => (
                        <div
                          key={despacho}
                          className='flex flex-col items-center mx-3 my-2 text-center'
                          style={{ minWidth: "100px" }}
                        >
                          <div
                            className='bg-gradient-to-t from-blue-600 to-blue-800 rounded-t-lg relative flex items-end justify-center text-white text-sm font-bold transition-all duration-500 ease-out shadow-lg'
                            style={{
                              height: `${(count / maxCount) * 200 + 30}px`,
                              width: "60px"
                            }}
                          >
                            <span className='absolute bottom-2.5'>{count}</span>
                          </div>
                          <p className='text-sm text-gray-700 mt-2.5 font-semibold break-words w-full px-1'>
                            {despacho}
                          </p>
                        </div>
                      ));
                  })()}
                </div>
              )}
            </div>

            {/* Chart 2: Entries per Departamento */}
            <div>
              {/* Reduced mb */}
              <h3 className='text-2xl font-bold text-gray-800 mb-4 text-center'>
                Registros por Departamento
              </h3>
              {data.length === 0 ? (
                // Reduced py
                <p className='text-gray-500 text-center text-lg py-6'>
                  No hay datos para generar el gráfico de departamentos.
                </p>
              ) : (
                <div
                  /* Reduced padding */ className='flex flex-wrap justify-center items-end bg-purple-50 p-5 rounded-xl min-h-[280px] overflow-x-auto border border-purple-100 shadow-inner'
                >
                  {(() => {
                    const departamentoCounts = data.reduce((acc, item) => {
                      const departamento =
                        item.departamento || "Sin Departamento";
                      acc[departamento] = (acc[departamento] || 0) + 1;
                      return acc;
                    }, {});

                    const maxCount = Math.max(
                      ...Object.values(departamentoCounts),
                      1
                    );

                    return Object.entries(departamentoCounts)
                      .sort()
                      .map(([departamento, count]) => (
                        <div
                          key={departamento}
                          className='flex flex-col items-center mx-3 my-2 text-center'
                          style={{ minWidth: "100px" }}
                        >
                          <div
                            className='bg-gradient-to-t from-purple-600 to-purple-800 rounded-t-lg relative flex items-end justify-center text-white text-sm font-bold transition-all duration-500 ease-out shadow-lg'
                            style={{
                              height: `${(count / maxCount) * 200 + 30}px`,
                              width: "60px"
                            }}
                          >
                            <span className='absolute bottom-2.5'>{count}</span>
                          </div>
                          <p className='text-sm text-gray-700 mt-2.5 font-semibold break-words w-full px-1'>
                            {departamento}
                          </p>
                        </div>
                      ));
                  })()}
                </div>
              )}
            </div>
          </section>
        )}

        {/* New MAPEO View */}
        {viewMode === "mapeo" && (
          // Reduced padding
          <section className='bg-white p-5 rounded-2xl shadow-xl border border-gray-200'>
            {/* Reduced mb */}
            <div className='flex justify-between items-center mb-5'>
              <h2 className='text-3xl font-bold text-gray-800 text-center w-full'>
                Vista de Mapeo de Celdas Activas
              </h2>
              <button
                onClick={() => setViewMode("initial")}
                className='px-6 py-3 bg-gray-700 text-white text-base font-medium rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 transition duration-200 ease-in-out transform hover:scale-105'
              >
                ← Volver al Inicio
              </button>
            </div>

            {/* Reduced padding, mb */}
            <div className='bg-green-50 p-4 rounded-xl mb-5 shadow-inner border border-green-100'>
              {/* Reduced mb */}
              <p className='text-gray-700 mb-3 text-lg font-medium text-center'>
                Introduce hasta dos números telefónicos para ver sus celdas
                activas en el mapa, o marca la opción para incluir todos los
                números de una columna específica de la base de datos.
              </p>
              {/* Reduced gap, mb */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-3'>
                <div>
                  <label
                    htmlFor='phoneNumber1Map'
                    className='block text-sm font-semibold text-gray-700 mb-1'
                  >
                    Número Telefónico 01:
                  </label>
                  <input
                    type='text'
                    id='phoneNumber1Map'
                    className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-base transition duration-150 ease-in-out'
                    value={phoneNumber1MapInput}
                    onChange={(e) => setPhoneNumber1MapInput(e.target.value)}
                    placeholder='Ej: +51 987 654 321'
                    disabled={includeAllPhoneNumber1Map}
                  />
                  {/* Reduced mt */}
                  <div className='flex items-center mt-1.5'>
                    <input
                      id='includeAllPhoneNumber1MapCheckbox'
                      type='checkbox'
                      className='h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer'
                      checked={includeAllPhoneNumber1Map}
                      onChange={(e) => {
                        setIncludeAllPhoneNumber1Map(e.target.checked);
                        // If checked, clear manual input for this field
                        if (e.target.checked) setPhoneNumber1MapInput("");
                      }}
                    />
                    {/* Reduced ml */}
                    <label
                      htmlFor='includeAllPhoneNumber1MapCheckbox'
                      className='ml-1.5 block text-sm font-medium text-gray-700 cursor-pointer'
                    >
                      Incluir todos los números de la base de datos (Teléfono
                      01)
                    </label>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor='phoneNumber2Map'
                    className='block text-sm font-semibold text-gray-700 mb-1'
                  >
                    Teléfono 02:
                  </label>
                  <input
                    type='text'
                    id='phoneNumber2Map'
                    className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-base transition duration-150 ease-in-out'
                    value={phoneNumber2MapInput}
                    onChange={(e) => setPhoneNumber2MapInput(e.target.value)}
                    placeholder='Ej: +51 912 345 678'
                    disabled={includeAllPhoneNumber2Map}
                  />
                  {/* Reduced mt */}
                  <div className='flex items-center mt-1.5'>
                    <input
                      id='includeAllPhoneNumber2MapCheckbox'
                      type='checkbox'
                      className='h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer'
                      checked={includeAllPhoneNumber2Map}
                      onChange={(e) => {
                        setIncludeAllPhoneNumber2Map(e.target.checked);
                        // If checked, clear manual input for this field
                        if (e.target.checked) setPhoneNumber2MapInput("");
                      }}
                    />
                    {/* Reduced ml */}
                    <label
                      htmlFor='includeAllPhoneNumber2MapCheckbox'
                      className='ml-1.5 block text-sm font-medium text-gray-700 cursor-pointer'
                    >
                      Incluir todos los números de la base de datos (Teléfono
                      02)
                    </label>
                  </div>
                </div>
              </div>
              <button
                onClick={handleMapDisplay}
                className='w-full inline-flex justify-center py-3.5 px-4 border border-transparent shadow-md text-lg font-bold rounded-lg text-white bg-gradient-to-r from-green-700 to-emerald-800 hover:from-green-800 hover:to-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition duration-300 ease-in-out transform hover:scale-105'
              >
                Mostrar en el Mapa
              </button>
              {mapStatusMessage && (
                <p
                  className={`text-base mt-4 text-center ${
                    mapStatusMessage.includes("No se encontraron")
                      ? "text-red-600"
                      : "text-blue-600"
                  } font-medium`}
                >
                  {mapStatusMessage}
                </p>
              )}
            </div>

            {/* Placeholder para la visualización del mapa */}
            {/* Reduced py */}
            <div className='text-center text-gray-600 py-8 border-4 border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center min-h-[200px]'>
              <p className='text-xl mb-4 font-semibold'>
                El mapa de Google se abrirá en una nueva pestaña.
              </p>
            </div>
          </section>
        )}

        {/* Modal de "No se encontraron datos" */}
        {showNoResultsModal && (
          <div className='fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4'>
            {/* Reduced padding */}
            <div className='bg-white rounded-2xl shadow-3xl p-7 m-4 max-w-md w-full text-center border-t-5 border-blue-600 transform scale-105 animate-scale-in'>
              {/* Reduced mb */}
              <h3 className='text-2xl font-bold text-gray-800 mb-3 text-center'>
                ¡Atención!
              </h3>
              {/* Reduced mb */}
              <p className='text-lg text-gray-700 mb-6'>
                No se encontraron registros que coincidan con los criterios de
                búsqueda.
              </p>
              <button
                onClick={() => setShowNoResultsModal(false)}
                className='px-9 py-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-lg font-bold rounded-lg shadow-md hover:from-blue-800 hover:to-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition duration-200 ease-in-out transform hover:scale-105'
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
