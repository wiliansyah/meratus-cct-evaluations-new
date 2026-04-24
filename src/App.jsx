import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Upload, Award, BookOpen, Building2,
  Eye, EyeOff, Search, X, RefreshCw, Download, Save,
  FileSpreadsheet, CheckCircle2, AlertCircle, Filter,
  Users, BarChart3, Lock, Layers, TableProperties,
  Printer, Check, ChevronDown, Sun, Moon,
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = 'new-cct-meratus';

const DEFAULT_TSV = `NO\tTraining Topic\tGroup SBU/SFU\tHead of SBU/SFU\tSME\tManager HRBP\tMeratus Academy\tAssessment Timeline\tUpdate CCT Module Timeline\tComprehensiveness of Theoretical Content HRBP\tComprehensiveness of Theoretical Content SME\tComprehensiveness of Theoretical Content ACADEMY\tComprehensiveness of Theoretical Content Average\tContent Accuracy & Validity HRBP\tContent Accuracy & Validity SME\tContent Accuracy & Validity ACADEMY\tContent Accuracy & Validity Average\tBusiness Relevance HRBP\tBusiness Relevance SME\tBusiness Relevance ACADEMY\tBusiness Relevance Average\tPractical Applicability HRBP\tPractical Applicability SME\tPractical Applicability ACADEMY\tPractical Applicability Average\tVisual & Slide Design HRBP\tVisual & Slide Design SME\tVisual & Slide Design ACADEMY\tVisual & Slide Design Average\tAlignment of Learning Evaluation HRBP\tAlignment of Learning Evaluation SME\tAlignment of Learning Evaluation ACADEMY\tAlignment of Learning Evaluation Average\tQuestions & Answer Options Quality HRBP\tQuestions & Answer Options Quality SME\tQuestions & Answer Options Quality ACADEMY\tQuestions & Answer Options Quality Average\tTotal Score\tFeedback for Improvement\tNew Participant Socre`;

// ==========================================
// PLACE YOUR CLICKABLE LINKS HERE
// Format: 'Exact Topic Name from TSV' : 'Your Link URL'
// ==========================================
const TOPIC_LINKS_RAW = { 
  'Action Tracker 2023': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FAction%20Tracker%202023&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'AI Workshop - AI Implementation Use Cases': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FAI%20Workshop%20%2D%20AI%20Implementation%20Use%20Cases&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'AI Workshop - Understanding the AI Landscape 2024': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FAI%20Workshop%20%2D%20Understanding%20the%20AI%20Landscape%202024&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - Basic Understanding Marine Insurance': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20Basic%20Understanding%20Marine%20Insurance&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - Chartering Operations': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20Chartering%20Operations&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - Digital Inspection and Documentation Software': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20Digital%20Inspection%20and%20Documentation%20Software&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - IMO Regulation - Marine Pollution MARPOL': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20IMO%20Regulation%20%2D%20Marine%20Pollution%20MARPOL&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - IMO Regulation SOLAS': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20IMO%20Regulation%20SOLAS&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - Inspeksi QSHE Alat Berat Depo': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20Inspeksi%20QSHE%20Alat%20Berat%20Depo&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - Inspeksi QSHE Alat Berat Terminal': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20Inspeksi%20QSHE%20Alat%20Berat%20Terminal&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - Inspeksi QSHE Operational Trucking MJT': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20Inspeksi%20QSHE%20Operational%20Trucking%20MJT&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - Inspeksi QSHE Repair Container': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20Inspeksi%20QSHE%20Repair%20Container&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - Inspeksi QSHE Warehouse': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20Inspeksi%20QSHE%20Warehouse&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - Introduction to Asset Charter Business': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20Introduction%20to%20Asset%20Charter%20Business&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - Introduction to Chartering': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20Introduction%20to%20Chartering&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - ISO 9001 2015': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20ISO%209001%202015&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - Lifting Cargoes on Flat Rack Container': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20Lifting%20Cargoes%20on%20Flat%20Rack%20Container&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - Non Vessel Asset Management Truck Trailer': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20Non%20Vessel%20Asset%20Management%20Truck%20Trailer&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - Non Vessel Risk Classification Measurement': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20Non%20Vessel%20Risk%20Classification%20Measurement&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - Pemahaman SMS melalui QSHE Barriers': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20Pemahaman%20SMS%20melalui%20QSHE%20Barriers&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Asset Charter - Standar Pedoman Implementasi QSHE Non Vessel': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FAsset%20Charter%20%2D%20Standar%20Pedoman%20Implementasi%20QSHE%20Non%20Vessel&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BA - Asset Charter Introduction to QSHE Meratus': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FBA%20%2D%20Asset%20Charter%20Introduction%20to%20QSHE%20Meratus&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BA - CLC Container Repair Process': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FBA%20%2D%20CLC%20Container%20Repair%20Process&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BA - CLC MLO Depot Business Marketing Strategy': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FBA%20%2D%20CLC%20MLO%20Depot%20Business%20Marketing%20Strategy&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BA - CLC Receiving Delivery and Stuffing Stripping Process at Depo': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FBA%20%2D%20CLC%20Receiving%20Delivery%20and%20Stuffing%20Stripping%20Process%20at%20Depo&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BA - Liner Basic Container': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FBA%20%2D%20Liner%20Basic%20Container&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BA - Liner Basic Knowledge Terminal Operation': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Ops%2FBA%20%2D%20Liner%20Basic%20Knowledge%20Terminal%20Operation&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BA - Liner Introduction to MFEC': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Ops%2FBA%20%2D%20Liner%20Introduction%20to%20MFEC&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BA - Liner Product Knowledge Meratus Liner': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FBA%20%2D%20Liner%20Product%20Knowledge%20Meratus%20Liner&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BA - Liner Service Excellence': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FBA%20%2D%20Liner%20Service%20Excellence&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BA - Liner Term of Shipment': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FBA%20%2D%20Liner%20Term%20of%20Shipment&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BA - Logistics Basic Knowledge Reefer': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBA%20%2D%20Logistics%20Basic%20Knowledge%20Reefer&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BA - Logistics Customs Clearance': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBA%20%2D%20Logistics%20Customs%20Clearance&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BA - Logistics Sea Freight Domestic': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBA%20%2D%20Logistics%20Sea%20Freight%20Domestic&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BA - Logistics Warehouse Transport': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBA%20%2D%20Logistics%20Warehouse%20Transport&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BA - MSM Introduction to Ship Management': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FBA%20%2D%20MSM%20Introduction%20to%20Ship%20Management&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BA - MTM Heavy Equipment Maintenance': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMTM%2FBA%20%2D%20MTM%20Heavy%20Equipment%20Maintenance&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic CLC - Terminal Basic Knowledge Business Process CLC Terminal': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FBasic%20CLC%20%2D%20Terminal%20Basic%20Knowledge%20Business%20Process%20CLC%20Terminal&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic CLC Depo Management': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FBasic%20CLC%20Depo%20Management&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic CLC Heavy Equipment': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FBasic%20CLC%20Heavy%20Equipment&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic CLC Pengetahuan Bongkar Muat': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FBasic%20CLC%20Pengetahuan%20Bongkar%20Muat&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic CLC Penyerahan dan Penerimaan Kontainer': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FBasic%20CLC%20Penyerahan%20dan%20Penerimaan%20Kontainer&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic CLC Repair Container': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FBasic%20CLC%20Repair%20Container&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic English - 16 Basic Tenses': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FBasic%20English%20%2D%2016%20Basic%20Tenses&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic English - Email Writing': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FBasic%20English%20%2D%20Email%20Writing&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic English - Negotiation Skills': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FBasic%20English%20%2D%20Negotiation%20Skills&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic English - Preposition of Time': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FBasic%20English%20%2D%20Preposition%20of%20Time&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic English - Presentation Skills': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FBasic%20English%20%2D%20Presentation%20Skills&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Excel Function': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FBasic%20Excel%20Function&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistic HS Code dan Kepabeanan': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistic%20HS%20Code%20dan%20Kepabeanan&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistic Reefer Container Handling': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistic%20Reefer%20Container%20Handling&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics - Commercial Account Plan': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20%2D%20Commercial%20Account%20Plan&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics - Commercial Basic Agency International Service': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20%2D%20Commercial%20Basic%20Agency%20International%20Service&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics - Commercial Exim dan Incoterms': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20%2D%20Commercial%20Exim%20dan%20Incoterms&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics - Commercial Incoterms Logistics': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20%2D%20Commercial%20Incoterms%20Logistics&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics - Commercial Sales Skills': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20%2D%20Commercial%20Sales%20Skills&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics - Operations Operation Monitoring System Support': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20%2D%20Operations%20Operation%20Monitoring%20System%20Support&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics - Operations SCM Profit': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20%2D%20Operations%20SCM%20Profit&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics - P3W Sales': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20%2D%20P3W%20Sales&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics Account Receivable': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20Account%20Receivable&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics Airfreight': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20Airfreight&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics Basic Knowledge Business Process Logistics': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20Basic%20Knowledge%20Business%20Process%20Logistics&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics Basic LCL Less than Container Load': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20Basic%20LCL%20Less%20than%20Container%20Load&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics Basic Operation': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20Basic%20Operation&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics Custom Clearence': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20Custom%20Clearence&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics Customer Service': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20Customer%20Service&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics Industrial Project': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20Industrial%20Project&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics Pemahaman Klaim Asuransi': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20Pemahaman%20Klaim%20Asuransi&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics Quality Management System': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20Quality%20Management%20System&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics Sea Freight': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20Sea%20Freight&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics Vendor Management': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20Vendor%20Management&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Logistics Warehouse Transport': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FBasic%20Logistics%20Warehouse%20Transport&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Operation 3 Port Info Ship Particular': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Ops%2FBasic%20Operation%203%20Port%20Info%20Ship%20Particular&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Operation 4 Loading Unloading': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Ops%2FBasic%20Operation%204%20Loading%20Unloading&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Operation 5 Container Inventory Management': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Ops%2FBasic%20Operation%205%20Container%20Inventory%20Management&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Operation 9 IMDG Code': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Ops%2FBasic%20Operation%209%20IMDG%20Code&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Public Speaking Skills': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHMM%2FBasic%20Public%20Speaking%20Skills&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Basic Shipping Basic Knowledge Business Process Shipping Liner': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FBasic%20Shipping%20Basic%20Knowledge%20Business%20Process%20Shipping%20Liner&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BPM - Assessment for Digital Transformation': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FBPM%20%2D%20Assessment%20for%20Digital%20Transformation&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BPM - Basic Shipping Induction Inbound and Outbound Process': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FBPM%20%2D%20Basic%20Shipping%20Induction%20Inbound%20and%20Outbound%20Process&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BPM - Business Process Management Framework': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FBPM%20%2D%20Business%20Process%20Management%20Framework&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BPM - Core Model Framework': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FBPM%20%2D%20Core%20Model%20Framework&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BPM - Management of P3W': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FBPM%20%2D%20Management%20of%20P3W&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BPM - Project Management': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FBPM%20%2D%20Project%20Management&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'BPM - Work Load Analysis for Project': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FBPM%20%2D%20Work%20Load%20Analysis%20for%20Project&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Business Control Framework 2024': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FInternal%20Audit%2FBusiness%20Control%20Framework%202024&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Business Negotiation Skill Malik': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FBusiness%20Negotiation%20Skill%20Malik&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Business Presentation Skill Malik': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FBusiness%20Presentation%20Skill%20Malik&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Business Process Modelling for Level 10 Above': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FBusiness%20Process%20Modelling%20for%20Level%2010%20Above&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Backlog Management': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Backlog%20Management&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Block Diagram pada System Electric': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Block%20Diagram%20pada%20System%20Electric&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Block Diagram pada System Engine': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Block%20Diagram%20pada%20System%20Engine&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Block Diagram pada System Hydraulic': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Block%20Diagram%20pada%20System%20Hydraulic&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Brake System': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Brake%20System&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Cara Menggunakan Common Tool': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Cara%20Menggunakan%20Common%20Tool&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Daily Maintenance': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Daily%20Maintenance&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Differential Final Drive': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Differential%20Final%20Drive&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Electrical System': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Electrical%20System&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Engine System': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Engine%20System&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Failure Analisis Report': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Failure%20Analisis%20Report&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Hydraulic System': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Hydraulic%20System&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Hydraulic Troubleshooting': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Hydraulic%20Troubleshooting&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Karakteristik Komponen Elektrik': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Karakteristik%20Komponen%20Elektrik&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Karakteristik Komponen Non Elektrik': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Karakteristik%20Komponen%20Non%20Elektrik&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Maintenance Process': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Maintenance%20Process&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Mekanik Troubleshooting': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Mekanik%20Troubleshooting&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Nama Fungsi Prinsip Kerja Komponen Engine': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Nama%20Fungsi%20Prinsip%20Kerja%20Komponen%20Engine&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Pembacaan Menu pada Monitoring System': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Pembacaan%20Menu%20pada%20Monitoring%20System&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Penanganan Claim Container': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Penanganan%20Claim%20Container&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Pengenalan Fungsi dari Komponen Accesories': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Pengenalan%20Fungsi%20dari%20Komponen%20Accesories&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Pengenalan Fungsi dari Komponen Electric': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Pengenalan%20Fungsi%20dari%20Komponen%20Electric&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Pengenalan Fungsi dari Komponen Hydraulic': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Pengenalan%20Fungsi%20dari%20Komponen%20Hydraulic&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Pengenalan Fungsi dari Komponen Power Train': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Pengenalan%20Fungsi%20dari%20Komponen%20Power%20Train&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Pengetahuan Forklift': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Pengetahuan%20Forklift&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Pengetahuan Reach Stacker': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Pengetahuan%20Reach%20Stacker&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Perencanaan Kebutuhan Alat Mekanis': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Perencanaan%20Kebutuhan%20Alat%20Mekanis&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Perencanaan Lay Out Depo': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Perencanaan%20Lay%20Out%20Depo&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Pricing Strategy': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Pricing%20Strategy&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Setting and Adjustment Major Component': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Setting%20and%20Adjustment%20Major%20Component&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Stack Hampar Container': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Stack%20Hampar%20Container&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Stuffing Stripping': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Stuffing%20Stripping&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Teknik Dasar Pengelasan': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Teknik%20Dasar%20Pengelasan&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Teknik Lepas Pasang Komponen Electric': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Teknik%20Lepas%20Pasang%20Komponen%20Electric&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Teknik Survey Quality Control': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Teknik%20Survey%20Quality%20Control&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Tyre Management': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Tyre%20Management&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Upload Download Program pada Unit': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Upload%20Download%20Program%20pada%20Unit&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC - Yard Management system': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%20%2D%20Yard%20Management%20system&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'CLC- Penanganan Cargo': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCLC%2FCLC%2D%20Penanganan%20Cargo&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Code of Conduct': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FInternal%20Audit%2FCode%20of%20Conduct&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Code of Conduct English Version': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FInternal%20Audit%2FCode%20of%20Conduct%20English%20Version&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Code of Conduct for Manager': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FInternal%20Audit%2FCode%20of%20Conduct%20for%20Manager&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Company Profile Meratus Group': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCorpCom%2FCompany%20Profile%20Meratus%20Group&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Company Regulation 2025 - 2027 Indonesian Version': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FCompany%20Regulation%202025%20%2D%202027%20Indonesian%20Version&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Company Regulation 2025-2027 English Version': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FCompany%20Regulation%202025%2D2027%20English%20Version&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Contract Management System for Level 10 Above': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLegal%2FContract%20Management%20System%20for%20Level%2010%20Above&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Control and Monitoring Malik': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FControl%20and%20Monitoring%20Malik&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Corp Comm - Branding Development': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCorpCom%2FCorp%20Comm%20%2D%20Branding%20Development&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Corp Comm - Communication Campaign': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCorpCom%2FCorp%20Comm%20%2D%20Communication%20Campaign&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Corporate Culture 2025': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FCorporate%20Culture%202025&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Crewing - Awareness ISO 37001 2016': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCrewing%2FCrewing%20%2D%20Awareness%20ISO%2037001%202016&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Crewing - Pelatihan Audit Internal ISO 37001 2016': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FCrewing%2FCrewing%20%2D%20Pelatihan%20Audit%20Internal%20ISO%2037001%202016&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Edukasi Pemilahan Sampah': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FEdukasi%20Pemilahan%20Sampah&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Effective Collaboration Malik': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FEffective%20Collaboration%20Malik&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Effective Planning Malik': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FEffective%20Planning%20Malik&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Fin Acc - Bills to Invoice': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FFinance%2FFin%20Acc%20%2D%20Bills%20to%20Invoice&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Fin Acc - Vendor Invoice Acceptance': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FFinance%2FFin%20Acc%20%2D%20Vendor%20Invoice%20Acceptance&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Fraud Awareness': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FInternal%20Audit%2FFraud%20Awareness&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'GA - Vehicle Maintenance': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FGA%2DAsset%20Property%2FGA%20%2D%20Vehicle%20Maintenance&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'GA - Vehicle Selling': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FGA%2DAsset%20Property%2FGA%20%2D%20Vehicle%20Selling&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'GA - Vehicle Usage': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FGA%2DAsset%20Property%2FGA%20%2D%20Vehicle%20Usage&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Good Corporate Governance 2024': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FInternal%20Audit%2FGood%20Corporate%20Governance%202024&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Group Policy - Authority Matrix': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FFinance%2FGroup%20Policy%20%2D%20Authority%20Matrix&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Group Policy - CAPEX': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FFinance%2FGroup%20Policy%20%2D%20CAPEX&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Group Policy - for Level 10 Above': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FInternal%20Audit%2FGroup%20Policy%20%2D%20for%20Level%2010%20Above&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Health Talk - Hari Anak - Ready Set School 2024': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FHealth%20Talk%20%2D%20Hari%20Anak%20%2D%20Ready%20Set%20School%202024&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Health Talk - Pencernaan Kuat Hidup Nikmat': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FHealth%20Talk%20%2D%20Pencernaan%20Kuat%20Hidup%20Nikmat&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Health Talk - Virus Monkeypox': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FHealth%20Talk%20%2D%20Virus%20Monkeypox&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HMM - Claim Procedure': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHMM%2FHMM%20%2D%20Claim%20Procedure&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HMM - Stowage Cargo Overview': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHMM%2FHMM%20%2D%20Stowage%20Cargo%20Overview&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'How To Create Contract - TPS HMM': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHMM%2FHow%20To%20Create%20Contract%20%2D%20TPS%20HMM&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HR - Aspek Normatif Hubungan Industrial': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FHR%20%2D%20Aspek%20Normatif%20Hubungan%20Industrial&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HR - Manajemen Remunerasi': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FHR%20%2D%20Manajemen%20Remunerasi&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HR - Manajemen Talenta': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FHR%20%2D%20Manajemen%20Talenta&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HR - Melaksanakan Analisa Beban Kerja': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FHR%20%2D%20Melaksanakan%20Analisa%20Beban%20Kerja&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HR - Membangun Komunikasi Organisasi Yang Efektif': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FHR%20%2D%20Membangun%20Komunikasi%20Organisasi%20Yang%20Efektif&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HR - Menyusun dan Merancang Kebutuhan Pembelajaran': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FHR%20%2D%20Menyusun%20dan%20Merancang%20Kebutuhan%20Pembelajaran&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HR - Menyusun Kebutuhan SDM': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FHR%20%2D%20Menyusun%20Kebutuhan%20SDM&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HR - Menyusun Peraturan Perusahaan Perjanjian Kerja': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FHR%20%2D%20Menyusun%20Peraturan%20Perusahaan%20Perjanjian%20Kerja&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HR - Menyusun Uraian Jabatan': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FHR%20%2D%20Menyusun%20Uraian%20Jabatan&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HR - Merancang Struktur Organisasi': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FHR%20%2D%20Merancang%20Struktur%20Organisasi&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HR - Merumuskan Indikator Kinerja Individu': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FHR%20%2D%20Merumuskan%20Indikator%20Kinerja%20Individu&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HR - Merumuskan Proses Bisnis dan SOP MSDM': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FHR%20%2D%20Merumuskan%20Proses%20Bisnis%20dan%20SOP%20MSDM&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HR - Merumuskan Strategi Manajemen SDM': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FHR%20%2D%20Merumuskan%20Strategi%20Manajemen%20SDM&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HR - Perselisihan Hubungan Industrial': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FHR%20%2D%20Perselisihan%20Hubungan%20Industrial&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'HR - Strategic Interviewing': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FHR%20%2D%20Strategic%20Interviewing&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Internal Audit - Enterprise Risk Management': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FInternal%20Audit%2FInternal%20Audit%20%2D%20Enterprise%20Risk%20Management&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Introduction to E-Pact Employee Self Service': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FIntroduction%20to%20E%2DPact%20Employee%20Self%20Service&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Introduction to HRIS Time Management Module PeopleStrong Employee Self Service': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FIntroduction%20to%20HRIS%20Time%20Management%20Module%20PeopleStrong%20Employee%20Self%20Service&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Introduction to Manager as A Profession': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FIntroduction%20to%20Manager%20as%20A%20Profession&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Introduction to Objectives Key Results 2024': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FIntroduction%20to%20Objectives%20Key%20Results%202024&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Introduction to PeopleStrong Learning Module': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FIntroduction%20to%20PeopleStrong%20Learning%20Module&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IR Management for Level 10 Above - 2025': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FIR%20Management%20for%20Level%2010%20Above%20%2D%202025&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT - Agile Scrum Introduction': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20Agile%20Scrum%20Introduction&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT - BitLocker Implementation Security Awareness': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D&id=%2Fsites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20BitLocker%20Implementation%20Security%20Awareness',

  'IT - Cybersecurity Awareness 2023': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20Cybersecurity%20Awareness%202023&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT - Design System': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20Design%20System&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT - Electronic Data Interchange Introduction': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20Electronic%20Data%20Interchange%20Introduction&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT - Implementation of Cast Software as Software Intelligence Automated 2023': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20Implementation%20of%20Cast%20Software%20as%20Software%20Intelligence%20Automated%202023&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT - Implementing RPA to Support The Business': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20Implementing%20RPA%20to%20Support%20The%20Business&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT - Infrastructure and Application Modernization': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20Infrastructure%20and%20Application%20Modernization&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT - Introduction to Microsoft Fabric': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20Introduction%20to%20Microsoft%20Fabric&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT - Meratus ACE Support Services': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20Meratus%20ACE%20Support%20Services&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT - Network Operation Center Introduction': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20Network%20Operation%20Center%20Introduction&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT - Personal Data Protection Law Things You Need to Know': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20Personal%20Data%20Protection%20Law%20Things%20You%20Need%20to%20Know&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT - Remote Monitoring System for Vessel IoT Solution': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20Remote%20Monitoring%20System%20for%20Vessel%20IoT%20Solution&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT - Secure Access Service Edge SASE': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20Secure%20Access%20Service%20Edge%20SASE&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT - Test Driven Development Introduction': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20Test%20Driven%20Development%20Introduction&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT - Understanding Security in Development and Operations Key Insights and Considerations': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20Understanding%20Security%20in%20Development%20and%20Operations%20Key%20Insights%20and%20Considerations&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT - UX Research': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%20%2D%20UX%20Research&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'IT- Clean Architecture Design Pattern': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FIT%2FIT%2D%20Clean%20Architecture%20Design%20Pattern&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Leaders Talk Artificial Intelligence': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FLeaders%20Talk%20Artificial%20Intelligence&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Leaders Talk Create Value Through Integrity - 2024': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FLeaders%20Talk%20Create%20Value%20Through%20Integrity%20%2D%202024&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Leaders Talk Economic Outlook': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FLeaders%20Talk%20Economic%20Outlook&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Leaders Talk Hari Anti Korupsi Sedunia': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FLeaders%20Talk%20Hari%20Anti%20Korupsi%20Sedunia&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Leaders Talk Intrapreneurship Result Oriented': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FLeaders%20Talk%20Intrapreneurship%20Result%20Oriented&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Leaders Talk Intrapreneurship Sense of Ownership': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FLeaders%20Talk%20Intrapreneurship%20Sense%20of%20Ownership&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Leaders Talk Kenali Demam Berdarah dan Pencegahannya': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FLeaders%20Talk%20Kenali%20Demam%20Berdarah%20dan%20Pencegahannya&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Leaders Talk Lesson from Eiger - From Local to the World': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FLeaders%20Talk%20Lesson%20from%20Eiger%20%2D%20From%20Local%20to%20the%20World&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Leaders Talk Nutrition Day 2024': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FLeaders%20Talk%20Nutrition%20Day%202024&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Leaders Talk We Aim for Customer Excellence Collaboration': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FLeaders%20Talk%20We%20Aim%20for%20Customer%20Excellence%20Collaboration&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Legal - Amendment to Indonesian Shipping Law 101': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLegal%2FLegal%20%2D%20Amendment%20to%20Indonesian%20Shipping%20Law%20101&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Legal - Implementation of Shipping Law': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLegal%2FLegal%20%2D%20Implementation%20of%20Shipping%20Law&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Legal - Indonesia Capital Market': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLegal%2FLegal%20%2D%20Indonesia%20Capital%20Market&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Legal - Overview of Indonesia Employment Law': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLegal%2FLegal%20%2D%20Overview%20of%20Indonesia%20Employment%20Law&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Legal - Personal Data Protection': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLegal%2FLegal%20%2D%20Personal%20Data%20Protection&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Legal - Teknik Merancang Kontrak': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLegal%2FLegal%20%2D%20Teknik%20Merancang%20Kontrak&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner - Basic Operation Transshipment': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Ops%2FLiner%20%2D%20Basic%20Operation%20Transshipment&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping 07 Term of Shipment': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%2007%20Term%20of%20Shipment&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping 1 Service Excellence': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%201%20Service%20Excellence&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping 10 Liner Services': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%2010%20Liner%20Services&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping 11 Basic Container': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%2011%20Basic%20Container&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping 12 Dangerous Goods': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%2012%20Dangerous%20Goods&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping 13 Reefer Handling': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%2013%20Reefer%20Handling&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping 14 Breakbulk Cargo Project': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%2014%20Breakbulk%20Cargo%20Project&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping 15 Cost of Failure Branch': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%2015%20Cost%20of%20Failure%20Branch&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping 16 Sales Activity Customer Profile': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%2016%20Sales%20Activity%20Customer%20Profile&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping 2 Product Knowledge and Cargo Shipment': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%202%20Product%20Knowledge%20and%20Cargo%20Shipment&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping 3 FAQ for Customer': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%203%20FAQ%20for%20Customer&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping 4 Basic Cargo Knowledge': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%204%20Basic%20Cargo%20Knowledge&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping 6 Bill of Lading': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%206%20Bill%20of%20Lading&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping 8 Terminal Productivity Operation Pattern': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%208%20Terminal%20Productivity%20Operation%20Pattern&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping Booking Process': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%20Booking%20Process&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping Incoterm 2020': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%20Incoterm%202020&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping Marine Insurance': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%20Marine%20Insurance&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping Meratus Extra VAS': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%20Meratus%20Extra%20VAS&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Basic Shipping Pengetahuan Kepabeanan dan Exim untuk Pelayaran': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Basic%20Shipping%20Pengetahuan%20Kepabeanan%20dan%20Exim%20untuk%20Pelayaran&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Body Language': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Body%20Language&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Business Development': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Business%20Development&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Calculate Rate Freight': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Calculate%20Rate%20Freight&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Customer Contract Key Account Management': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Customer%20Contract%20Key%20Account%20Management&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Decision Making Unit': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Decision%20Making%20Unit&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Halal Cargo Assurance': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Halal%20Cargo%20Assurance&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Know Your Customer': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Know%20Your%20Customer&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - Marine Cargo Insurance': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20Marine%20Cargo%20Insurance&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial - SOC Business': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20%2D%20SOC%20Business&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Commercial Handling Complaint': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Commercial%2FLiner%20Commercial%20Handling%20Complaint&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Ops - MFEC Operational Ship Performance': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Ops%2FLiner%20Ops%20%2D%20MFEC%20Operational%20Ship%20Performance&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Ops - Ship Stability': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Ops%2FLiner%20Ops%20%2D%20Ship%20Stability&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Ops - Voyage Proforma Scheduling Introduction': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Ops%2FLiner%20Ops%20%2D%20Voyage%20Proforma%20Scheduling%20Introduction&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Trade - 01 Route Profitability': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Trade%2FLiner%20Trade%20%2D%2001%20Route%20Profitability&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Trade - Annual Budgeting': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Trade%2FLiner%20Trade%20%2D%20Annual%20Budgeting&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Trade - Contribution Margin Engine Time Charter Equivalent and VOE': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Trade%2FLiner%20Trade%20%2D%20Contribution%20Margin%20Engine%20Time%20Charter%20Equivalent%20and%20VOE&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Trade - Customer Segmentation': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Trade%2FLiner%20Trade%20%2D%20Customer%20Segmentation&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Trade - Joint Slot 2024': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Trade%2FLiner%20Trade%20%2D%20Joint%20Slot%202024&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Trade - Slot Cost': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Trade%2FLiner%20Trade%20%2D%20Slot%20Cost&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Liner Trade - Tier Pricing': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLiner%20Trade%2FLiner%20Trade%20%2D%20Tier%20Pricing&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Logistics - Cargo Document Handling': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FLogistics%20%2D%20Cargo%20Document%20Handling&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Logistics - Claim and Insurance': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FLogistics%20%2D%20Claim%20and%20Insurance&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Logistics - ISO License Audit Process': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FLogistics%20%2D%20ISO%20License%20Audit%20Process&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Logistics - Penerapan SJPH dan Penyelia Halal': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FLogistics%20%2D%20Penerapan%20SJPH%20dan%20Penyelia%20Halal&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Logistics - Vendor Management Sea Freight Domestic': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FLogistics%2FLogistics%20%2D%20Vendor%20Management%20Sea%20Freight%20Domestic&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Management by Objective Malik': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FManagement%20by%20Objective%20Malik&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Managing Conflicts Malik': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FManaging%20Conflicts%20Malik&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Managing Conversation Malik': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FManaging%20Conversation%20Malik&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Managing Meeting Malik': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FManaging%20Meeting%20Malik&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Managing Superiors and Colleagues Malik': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FManaging%20Superiors%20and%20Colleagues%20Malik&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Managing Yourself Malik': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FManaging%20Yourself%20Malik&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - Booking Module': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20Booking%20Module&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - Customer Master': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20Customer%20Master&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - Customer Tier Pricing DSS': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20Customer%20Tier%20Pricing%20DSS&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - Documentation Module': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20Documentation%20Module&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - Invoice Data Reference': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20Invoice%20Data%20Reference&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - Invoicing Module v0': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20Invoicing%20Module%20v0&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - Node Master 2024': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20Node%20Master%202024&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - OnOff Hire Module 2024': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20OnOff%20Hire%20Module%202024&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - Penalty Booking': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20Penalty%20Booking&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - Port Call Report 2024': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20Port%20Call%20Report%202024&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - Quick Manual Container Movement and Status': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20Quick%20Manual%20Container%20Movement%20and%20Status&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - Rate Report': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20Rate%20Report&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - Rating Method': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20Rating%20Method&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - Service Contract': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20Service%20Contract&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - Surcharge 2025': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20Surcharge%202025&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - Training for SPU': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20Training%20for%20SPU&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MELISA - VAS Booking': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMELISA%20%2D%20VAS%20Booking&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Meratus s New Vision and Mission': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FMeratus%20s%20New%20Vision%20and%20Mission&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'M-One Customer Journey': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FM%2DOne%20Customer%20Journey&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'M-One Induction M-One for Internal Stakeholders': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FM%2DOne%20Induction%20M%2DOne%20for%20Internal%20Stakeholders&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MQS P3W Awareness 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FMQS%20P3W%20Awareness%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Management System Data Base PBM': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Management%20System%20Data%20Base%20PBM&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Pelatihan Dasar Pengoperasian Ruber TYRE GANTRY': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Pelatihan%20Dasar%20Pengoperasian%20Ruber%20TYRE%20GANTRY&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Pelatihan Dasar Pengoperasian Side Loader Single Handler': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Pelatihan%20Dasar%20Pengoperasian%20Side%20Loader%20Single%20Handler&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Pelatihan Harbour Mobile Crane': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Pelatihan%20Harbour%20Mobile%20Crane&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Penanganan Container': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Penanganan%20Container&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Penanganan Reefer Container': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Penanganan%20Reefer%20Container&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Penanganan Uncontainerized': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Penanganan%20Uncontainerized&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Penanggulangan Kebakaran dan Pengenalan APAR': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Penanggulangan%20Kebakaran%20dan%20Pengenalan%20APAR&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Pendapatan Biaya PBM': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Pendapatan%20Biaya%20PBM&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Pengetahuan Bongkar Muat 2023': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Pengetahuan%20Bongkar%20Muat%202023&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Pengetahuan Claim PBM': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Pengetahuan%20Claim%20PBM&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Pengetahuan Container': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Pengetahuan%20Container&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Pengetahuan Stowage Plan': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Pengetahuan%20Stowage%20Plan&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Pengoperasian Dasar Ship to Shore': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Pengoperasian%20Dasar%20Ship%20to%20Shore&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Perencanaan Bongkar Muat': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Perencanaan%20Bongkar%20Muat&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Perencanaan Kebutuhan TKBM': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Perencanaan%20Kebutuhan%20TKBM&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSA - Perencanaan Layout CY': '',

  'MSA - Stacking Container di CY': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSA%2FMSA%20%2D%20Stacking%20Container%20di%20CY&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM - Painting Maintenance': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20%2D%20Painting%20Maintenance&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 01 Aux Mach Fuel System - 2025': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2001%20Aux%20Mach%20Fuel%20System%20%2D%202025&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 01 Engine Performance Normal Operation 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2001%20Engine%20Performance%20Normal%20Operation%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 01 Engine Plan Fuel System': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2001%20Engine%20Plan%20Fuel%20System&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 02 Aux Mach Charge Air System': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2002%20Aux%20Mach%20Charge%20Air%20System&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 02 Engine Performance Overload Engine Operation': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2002%20Engine%20Performance%20Overload%20Engine%20Operation&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 02 Engine Plan Charge Scavenge Air System': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2002%20Engine%20Plan%20Charge%20Scavenge%20Air%20System&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 03 Engine Performance - Function of Collecting Data': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2003%20Engine%20Performance%20%2D%20Function%20of%20Collecting%20Data&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 03 Engine Plan Compression System': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2003%20Engine%20Plan%20Compression%20System&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 04 Aux Mach Refrigerator 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2004%20Aux%20Mach%20Refrigerator%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 04 Engine Performance - Heat Balance Efficiency': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2004%20Engine%20Performance%20%2D%20Heat%20Balance%20Efficiency&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 04 Engine Plan Starting Air System 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2004%20Engine%20Plan%20Starting%20Air%20System%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 05 Aux Mach Controllable Pitch Propeller': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2005%20Aux%20Mach%20Controllable%20Pitch%20Propeller&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 05 Engine Performance Monitoring of Engine Performance': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2005%20Engine%20Performance%20Monitoring%20of%20Engine%20Performance&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 05 Engine Plan Cooling System': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2005%20Engine%20Plan%20Cooling%20System&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 06 Aux Mach Lubricating Oil System 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2006%20Aux%20Mach%20Lubricating%20Oil%20System%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 06 Engine Plan Lubricating System 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2006%20Engine%20Plan%20Lubricating%20System%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 07 Aux Mach Cooling System': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2007%20Aux%20Mach%20Cooling%20System&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 08 Aux Mach Starting System 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2008%20Aux%20Mach%20Starting%20System%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Machinery - 09 Aux Mach Purification System': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Machinery%20%2D%2009%20Aux%20Mach%20Purification%20System&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Marine - 01 Safety Of Life At Sea 2026': '',

  'MSM Marine - 02 Marine Polution 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Marine%20%2D%2002%20Marine%20Polution%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Marine - 03 STCW 2010 - 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Marine%20%2D%2003%20STCW%202010%20%2D%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Marine - 04 MLC 2006 - 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Marine%20%2D%2004%20MLC%202006%20%2D%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Marine - 05 ISM Code 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Marine%20%2D%2005%20ISM%20Code%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Marine - 06 ISPS Code 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Marine%20%2D%2006%20ISPS%20Code%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Marine - 07 Ballast Water Management 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Marine%20%2D%2007%20Ballast%20Water%20Management%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Marine - 08 Garbage Management 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Marine%20%2D%2008%20Garbage%20Management%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Marine - 09 Bridge Resource Management 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Marine%20%2D%2009%20Bridge%20Resource%20Management%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Marine - 10 Safety Drill 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Marine%20%2D%2010%20Safety%20Drill%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Marine - 12 Class Survey 13 Ship Certificates 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Marine%20%2D%2012%20Class%20Survey%2013%20Ship%20Certificates%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Marine - 14 Crewing Management Certificate 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Marine%20%2D%2014%20Crewing%20Management%20Certificate%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'MSM Marine - 15 UU Pelayaran 2026': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FMSM%20Marine%20%2D%2015%20UU%20Pelayaran%202026&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'NOVA - User Manual Procedure': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FFinance%2FNOVA%20%2D%20User%20Manual%20Procedure&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'OKR Certification Leadership and Goal Setting Module 1': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FOKR%20Certification%20Leadership%20and%20Goal%20Setting%20Module%201&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'OKR Certification Leadership and Goal Setting Module 2': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FOKR%20Certification%20Leadership%20and%20Goal%20Setting%20Module%202&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'OKR Certification Leadership and Goal Setting Module 3': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FOKR%20Certification%20Leadership%20and%20Goal%20Setting%20Module%203&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'OKR Certification Leadership and Goal Setting Module 4': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHRD%2FOKR%20Certification%20Leadership%20and%20Goal%20Setting%20Module%204&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Personal Development - 15 Management Essential to Become Good Manager - 2024': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FPersonal%20Development%20%2D%2015%20Management%20Essential%20to%20Become%20Good%20Manager%20%2D%202024&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Personal Development Computer Posture': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FPersonal%20Development%20Computer%20Posture&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Personal Development Etika Pergaulan': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FPersonal%20Development%20Etika%20Pergaulan&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Problem Solving Malik': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FProblem%20Solving%20Malik&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Procurement - Basic Knowledge': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FProcurement%2FProcurement%20%2D%20Basic%20Knowledge&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Procurement - D365 Inventory Request dan Purchase Request': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FProcurement%2FProcurement%20%2D%20D365%20Inventory%20Request%20dan%20Purchase%20Request&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Procurement - D365 Request for Quotation Purchase Order': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FProcurement%2FProcurement%20%2D%20D365%20Request%20for%20Quotation%20Purchase%20Order&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Procurement - Distribution Management': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FProcurement%2FProcurement%20%2D%20Distribution%20Management&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Procurement - Finance for Non Finance': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FProcurement%2FProcurement%20%2D%20Finance%20for%20Non%20Finance&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Procurement - Inventory Management': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FProcurement%2FProcurement%20%2D%20Inventory%20Management&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Procurement - Warehouse Management': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FProcurement%2FProcurement%20%2D%20Warehouse%20Management&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Procurement MSM - Econnect Flow Functionalities': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FProcurement%20MSM%2FProcurement%20MSM%20%2D%20Econnect%20Flow%20Functionalities&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Quality Awareness': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FQuality%20Awareness&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Risk Management for Level 12 Above': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FRisk%20Management%20for%20Level%2012%20Above&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Root Cause Analysis for Level 10 Above': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FRoot%20Cause%20Analysis%20for%20Level%2010%20Above&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Safety Leadership 2024': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FAsset%20%26%20Charter%2FSafety%20Leadership%202024&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Sistem Informasi Ketidaksesuaian dan Pengembangan SIKaP': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FBPM%2FSistem%20Informasi%20Ketidaksesuaian%20dan%20Pengembangan%20SIKaP&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'SM - Docking Contract': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FSM%20%2D%20Docking%20Contract&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'SM - Docking D-12': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FSM%20%2D%20Docking%20D%2D12&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'SM - MariApps COMPASS Change Management': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FSM%20%2D%20MariApps%20COMPASS%20Change%20Management&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'SM Docking Management - Module 1 Background and Introduction to Dry Docking': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FSM%20Docking%20Management%20%2D%20Module%201%20Background%20and%20Introduction%20to%20Dry%20Docking&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'SM Docking Management - Module 2 Project Management': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FSM%20Docking%20Management%20%2D%20Module%202%20Project%20Management&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'SM Docking Management - Module 3 Planning and Specification': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FSM%20Docking%20Management%20%2D%20Module%203%20Planning%20and%20Specification&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'SM Docking Management - Module 4 Tendering for Dry Dock Work': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FSM%20Docking%20Management%20%2D%20Module%204%20Tendering%20for%20Dry%20Dock%20Work&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'SM Docking Management - Module 5 Dry Dock Preparation Execution and Supervision': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FSM%20Docking%20Management%20%2D%20Module%205%20Dry%20Dock%20Preparation%20Execution%20and%20Supervision&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'SM Docking Management - Module 6 Docking Undocking and Completion of Project': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FSM%20Docking%20Management%20%2D%20Module%206%20Docking%20Undocking%20and%20Completion%20of%20Project&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'SM Workshop - Generator': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FSM%20Workshop%20%2D%20Generator&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'SM Workshop - Global Maritime Distress Safety System': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D&id=%2Fsites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMSM%2FSM%20Workshop%20%2D%20Global%20Maritime%20Distress%20Safety%20System',

  'Sosialisasi Aktivasi Registrasi CORETAX': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FSosialisasi%20Aktivasi%20Registrasi%20CORETAX&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Sosialisasi BPJS Kesehatan Segmen PPU': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FSosialisasi%20BPJS%20Kesehatan%20Segmen%20PPU&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Sosialisasi BPJS Ketenagakerjaan - Manfaat Layanan BPJS': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FMeratus%20Academy%2FSosialisasi%20BPJS%20Ketenagakerjaan%20%2D%20Manfaat%20Layanan%20BPJS&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66551774F%7D',

  'Stakeholder Management': 'https://meratus.sharepoint.com/sites/mkm/hr/Meratus%20Training/Forms/AllItems.aspx?RootFolder=/sites%2Fmkm%2Fhr%2FMeratus%20Training%2FModule%20PeopleStrong%20%283%5F26%29%2FHMM%2FStakeholder%20Management&View=%7B918ACDD9%2DCE23%2D4E3D%2DB8D5%2DABF66'
};

const parseNum = (val) => {
  if (!val || val === '#DIV/0!' || val === '#N/A') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
};

const resolveLink = (topic) => {
  if (!topic) return null;
  if (TOPIC_LINKS_RAW[topic]) return TOPIC_LINKS_RAW[topic];
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const nt = norm(topic);
  for (let k in TOPIC_LINKS_RAW) {
    const nk = norm(k);
    if (nk === nt || nt.includes(nk) || nk.includes(nt)) return TOPIC_LINKS_RAW[k];
  }
  return null;
};

const getHrbp = (row) => {
  if (!row) return '';
  if (row['Manager HRBP']) return row['Manager HRBP'];
  if (row['HRBP']) return row['HRBP'];
  const k = Object.keys(row).find(k =>
    k.toUpperCase().includes('HRBP') &&
    !['COMPREHENSIVENESS','ACCURACY','RELEVANCE','PRACTICAL','VISUAL','ALIGNMENT','QUESTIONS']
      .some(w => k.toUpperCase().includes(w))
  );
  return k ? row[k] : '';
};

const checkEvaluated = (row, role) =>
  Object.keys(row).filter(k =>
    k.toUpperCase().includes(role) &&
    !k.toUpperCase().includes('AVERAGE') &&
    ['Comprehensiveness','Accuracy','Relevance','Practical','Visual','Alignment','Questions']
      .some(w => k.includes(w))
  ).some(k => parseNum(row[k]) !== null);

/* ─── Theme helper ──────────────────────────────────────────────────────── */
const mkTheme = (dark) => ({
  root:            dark ? 'bg-slate-950 text-slate-200' : 'bg-slate-100 text-slate-900',
  nav:             dark ? 'bg-[#0F172A] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900',
  navTitle:        dark ? 'text-white' : 'text-slate-900',
  navSync:         dark ? 'text-slate-400' : 'text-slate-500',
  navSyncDot:      (err) => err ? 'bg-rose-500' : dark ? 'bg-emerald-400' : 'bg-emerald-500',
  navThemeBtn:     dark ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700',
  tabBar:          dark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200',
  tabActive:       'bg-blue-600 text-white shadow-md',
  tabInactive:     dark ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-white',
  filtersBar:      dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
  filterLabel:     dark ? 'text-slate-300' : 'text-slate-600',
  filterBtn:       (active) => active
    ? (dark ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800 shadow-inner' : 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-inner')
    : (dark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'),
  filterBtnAllScored: (active) => active
    ? (dark ? 'bg-violet-900/50 text-violet-400 border-violet-800 shadow-inner' : 'bg-violet-50 text-violet-700 border-violet-300 shadow-inner')
    : (dark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'),
  filterBtnIcon:   (active) => active ? (dark ? 'text-emerald-400' : 'text-emerald-600') : (dark ? 'text-slate-500' : 'text-slate-400'),
  filterBtnIconViolet: (active) => active ? (dark ? 'text-violet-400' : 'text-violet-600') : (dark ? 'text-slate-500' : 'text-slate-400'),
  allScoredBadge:  (active) => active ? (dark ? 'bg-violet-800/60 text-violet-200' : 'bg-violet-100 text-violet-700') : (dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'),
  clearBtn:        dark ? 'text-rose-400 hover:text-rose-100 bg-rose-950/30 hover:bg-rose-900 border-rose-900/50' : 'text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200',
  card:            dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
  cardSubBg:       dark ? 'bg-slate-950/30' : 'bg-slate-50',
  sectionTitle:    dark ? 'text-slate-300' : 'text-slate-600',
  divider:         dark ? 'border-slate-800' : 'border-slate-200',
  metricLabel:     dark ? 'text-slate-500' : 'text-slate-500',
  tableSection:    dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
  tableHead:       dark ? 'bg-slate-800 text-slate-400 ring-slate-700' : 'bg-slate-100 text-slate-500 ring-slate-200',
  tableRowAlt:     dark ? 'bg-slate-800/30' : 'bg-slate-50',
  tableRowHover:   dark ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50',
  tableCellMuted:  dark ? 'text-slate-500' : 'text-slate-400',
  tableCellMain:   dark ? 'text-slate-200' : 'text-slate-800',
  tableBorder:     dark ? 'border-slate-800' : 'border-slate-200',
  tableTabActive:  (v) => v === 'scored'
    ? (dark ? 'border-blue-500 text-blue-400 bg-slate-800/50' : 'border-blue-500 text-blue-600 bg-blue-50/50')
    : (dark ? 'border-amber-500 text-amber-400 bg-slate-800/50' : 'border-amber-500 text-amber-600 bg-amber-50/50'),
  tableTabInactive: dark ? 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-700',
  detailToggle:    (on) => on
    ? (dark ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-800 hover:bg-indigo-900' : 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100')
    : (dark ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'),
  inputBase:       dark ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400',
  selectBase:      dark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700',
  sourceCard:      dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
  sourceHeader:    dark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200',
  sourceLabel:     dark ? 'text-slate-200' : 'text-slate-800',
  sourceSub:       dark ? 'text-slate-400' : 'text-slate-500',
  textareaBase:    dark ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800',
  lockBg:          dark ? 'bg-slate-900/50' : 'bg-white',
  lockIcon:        dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200',
  lockTitle:       dark ? 'text-slate-100' : 'text-slate-900',
  lockSub:         dark ? 'text-slate-400' : 'text-slate-500',
  lockInput:       dark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800',
  lockEyeBtn:      dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600',
  subScoreNormal:  dark ? 'bg-slate-800/30 text-slate-400' : 'bg-slate-50 text-slate-500',
  subScoreLow:     'bg-red-950/30 text-red-400 font-bold border-x border-red-900/50',
  sbuCardBg:       dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
  sbuOtherBg:      dark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700',
  sbuOtherDivider: dark ? 'bg-slate-700' : 'bg-slate-300',
  sbuPendingWrap:  dark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200',
  sbuPendingChip:  dark ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-500 bg-white border-slate-200',
  sbuPendingNum:   dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600',
  catPanel:        dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
  catBarBg:        dark ? 'bg-slate-800' : 'bg-slate-200',
  sbuHeaderWrap:   dark ? 'bg-blue-900/30 border-blue-800/50' : 'bg-blue-50 border-blue-200',
  sbuHeaderIcon:   dark ? 'text-blue-400' : 'text-blue-600',
  sbuHeaderTitle:  dark ? 'text-slate-200' : 'text-slate-700',
  sbuCountBadge:   dark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500',
  noDataIcon:      dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200',
  noDataTitle:     dark ? 'text-slate-300' : 'text-slate-600',
  noDataSub:       dark ? 'text-slate-500' : 'text-slate-400',
  pendingBadge:    dark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200',
  ddSelectCls:     dark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600',
  ddBtn:           dark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
  ddBtnVal:        dark ? 'text-slate-100' : 'text-slate-800',
  ddPanel:         dark ? 'bg-slate-900 border-slate-700 ring-black/50' : 'bg-white border-slate-200 shadow-lg ring-black/5',
  ddPanelLabel:    dark ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-100',
  ddItem:          dark ? 'hover:bg-slate-800' : 'hover:bg-slate-50',
  ddItemText:      (sel) => sel ? 'text-blue-400' : (dark ? 'text-slate-300' : 'text-slate-600'),
  ddCheckBox:      (sel) => sel ? 'bg-blue-600 border-blue-600' : (dark ? 'border-slate-600 group-hover:border-blue-500' : 'border-slate-300 group-hover:border-blue-400'),
  gsiInput:        dark ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400',
  gsiDropdown:     dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-lg',
  gsiItem:         dark ? 'hover:bg-slate-800 text-slate-200 border-slate-800' : 'hover:bg-slate-50 text-slate-700 border-slate-100',
  gsiClearBtn:     dark ? 'hover:bg-slate-800' : 'hover:bg-slate-100',
  gsiNoMatch:      dark ? 'text-slate-500' : 'text-slate-400',
  loadingText:     dark ? 'text-slate-500' : 'text-slate-400',
  exportBtn:       'text-white bg-blue-600 hover:bg-blue-700',
  pdfBtn:          'text-white bg-blue-600 hover:bg-blue-700',
  saveBtn:         'text-white bg-blue-600 hover:bg-blue-700',
});

/* ─── MultiSelectDropdown ─────────────────────────────────────────────── */
const MultiSelectDropdown = ({ label, options, selectedValues, onToggle, tc }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative inline-block text-left" ref={ref} style={{ zIndex: isOpen ? 100 : 50 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${tc.ddBtn} text-[10px] font-bold uppercase rounded-lg px-3 py-2 flex items-center gap-2 transition-all shadow-sm border`}
      >
        <span className="opacity-60">{label}:</span>
        <span className={tc.ddBtnVal}>
          {selectedValues.length === 0 || selectedValues.includes('all') ? 'All' : `${selectedValues.length} Active`}
        </span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className={`absolute left-0 mt-2 w-56 ${tc.ddPanel} border rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-100 ring-4`}>
          <div className={`px-3 py-1 mb-1 border-b ${tc.ddPanelLabel}`}>
            <span className="text-[9px] font-black uppercase tracking-widest">Select Filters</span>
          </div>
          {options.map((opt) => (
            <label key={opt.id} className={`flex items-center px-4 py-2.5 ${tc.ddItem} cursor-pointer group transition-colors`}>
              <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${tc.ddCheckBox(selectedValues.includes(opt.id))}`}>
                {selectedValues.includes(opt.id) && <Check size={10} className="text-white stroke-[4px]" />}
              </div>
              <input type="checkbox" className="hidden" checked={selectedValues.includes(opt.id)} onChange={() => onToggle(opt.id)} />
              <span className={`ml-3 text-[10px] font-bold uppercase tracking-wider ${tc.ddItemText(selectedValues.includes(opt.id))}`}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── GlobalSuggestionInput ───────────────────────────────────────────── */
const GlobalSuggestionInput = ({ value, setValue, placeholder, list, icon: Icon, tc }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', h);
    document.addEventListener('touchstart', h);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('touchstart', h); };
  }, []);
  return (
    <div className="relative w-full sm:w-56 flex-shrink-0" ref={ref}>
      <div className="relative flex items-center group">
        <Icon className="absolute left-3.5 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder={placeholder}
          className={`w-full pl-10 pr-8 py-2 border shadow-sm rounded-full text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${tc.gsiInput}`}
          value={value}
          onChange={(e) => { setValue(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
        />
        {value && (
          <button type="button" onClick={() => setValue('')} className={`absolute right-2 p-1 ${tc.gsiClearBtn} rounded-full transition-colors z-10`}>
            <X size={12} className="text-slate-400" />
          </button>
        )}
      </div>
      {isOpen && (
        <div className={`absolute z-50 left-0 right-0 mt-2 ${tc.gsiDropdown} border rounded-xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2`}>
          {list.filter(i => i.toLowerCase().includes(value.toLowerCase())).slice(0, 30).map((item, i) => (
            <button key={i} type="button"
              className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors border-b last:border-0 ${tc.gsiItem}`}
              onClick={(e) => { e.preventDefault(); setValue(item); setIsOpen(false); }}
            >
              {item}
            </button>
          ))}
          {list.filter(i => i.toLowerCase().includes(value.toLowerCase())).length === 0 && (
            <div className={`px-4 py-3 text-xs font-medium italic text-center ${tc.gsiNoMatch}`}>No match found</div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── App ─────────────────────────────────────────────────────────────── */
export default function App() {
  const [activeTab,        setActiveTab]        = useState('simplifikasi');
  const [tableView,        setTableView]        = useState('scored');
  const [showDetails,      setShowDetails]      = useState(false);
  const [showChecklist,    setShowChecklist]    = useState(false);
  const [scoreFilters,     setScoreFilters]     = useState(['all']);
  const [evaluatorFilters, setEvaluatorFilters] = useState(['all']);
  const [sortOrder,        setSortOrder]        = useState('none');
  const [rawData,          setRawData]          = useState(DEFAULT_TSV);
  const [isDownloading,    setIsDownloading]    = useState(false);
  const [isAuthorized,     setIsAuthorized]     = useState(false);
  const [passwordInput,    setPasswordInput]    = useState('');
  const [showPassword,     setShowPassword]     = useState(false);
  const [user,             setUser]             = useState(null);
  const [isLoadingData,    setIsLoadingData]    = useState(true);
  const [isSaving,         setIsSaving]         = useState(false);
  const [syncError,        setSyncError]        = useState(null);
  
  // Changed this from true to false for Light Mode default
  const [isDarkMode,       setIsDarkMode]       = useState(false);
  
  const [allScoredFilter,  setAllScoredFilter]  = useState(false);

  const [topicFilter, setTopicFilter] = useState('');
  const [sbuFilter,   setSbuFilter]   = useState('');
  const [hrbpFilter,  setHrbpFilter]  = useState('');
  const [completeSbuOnly, setCompleteSbuOnly] = useState(false);

  // Build theme object whenever dark mode changes
  const tc = useMemo(() => mkTheme(isDarkMode), [isDarkMode]);

  /* ── Firebase auth ────────────────────────────────────────────────── */
  useEffect(() => {
    const init = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token)
          await signInWithCustomToken(auth, __initial_auth_token);
        else
          await signInAnonymously(auth);
      } catch { setSyncError('Auth Fail'); setIsLoadingData(false); }
    };
    init();
    const unsub = onAuthStateChanged(auth, u => { setUser(u); if (!u) setIsLoadingData(false); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'artifacts', APP_ID, 'public', 'data', 'dashboard', 'tsv_data');
    const unsub = onSnapshot(ref,
      snap => { if (snap.exists() && snap.data().tsvData) setRawData(snap.data().tsvData); setIsLoadingData(false); setSyncError(null); },
      ()    => { setSyncError('Sync Fail'); setIsLoadingData(false); }
    );
    return () => unsub();
  }, [user]);

  /* ── Parse TSV ────────────────────────────────────────────────────── */
  const parsedData = useMemo(() => {
    if (!rawData?.trim()) return [];
    const lines = rawData.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split('\t').map(h => h.trim());
    return lines.slice(1).map(line => {
      const vals = line.split('\t');
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i]?.trim() ?? ''; });
      obj._TotalScore  = parseNum(obj['Total Score']);
      obj._Theory      = parseNum(obj['Comprehensiveness of Theoretical Content Average']);
      obj._Accuracy    = parseNum(obj['Content Accuracy & Validity Average']);
      obj._Relevance   = parseNum(obj['Business Relevance Average']);
      obj._Practical   = parseNum(obj['Practical Applicability Average']);
      obj._Visual      = parseNum(obj['Visual & Slide Design Average']);
      obj._Eval        = parseNum(obj['Alignment of Learning Evaluation Average']);
      obj._QA          = parseNum(obj['Questions & Answer Options Quality Average']);
      obj._hasHRBP     = checkEvaluated(obj, 'HRBP');
      obj._hasSME      = checkEvaluated(obj, 'SME');
      obj._hasAcademy  = checkEvaluated(obj, 'ACADEMY');
      return obj;
    });
  }, [rawData]);

  const sbuStats = useMemo(() => {
    const s = {};
    parsedData.forEach(d => {
      const sbu = d['Group SBU/SFU'] || 'Unknown';
      if (!s[sbu]) s[sbu] = { total: 0, evaluated: 0 };
      s[sbu].total++;
      if (d._TotalScore !== null) s[sbu].evaluated++;
    });
    return s;
  }, [parsedData]);

  const suggestions = useMemo(() => ({
    topics: [...new Set(parsedData.map(d => d['Training Topic']).filter(Boolean))].sort(),
    sbus:   [...new Set(parsedData.map(d => d['Group SBU/SFU']).filter(Boolean))].sort(),
    hrbps:  [...new Set(parsedData.map(d => getHrbp(d)).filter(h => h && h !== '-'))].sort(),
  }), [parsedData]);

  const globallyFilteredData = useMemo(() => {
    let data = parsedData;
    if (completeSbuOnly)
      data = data.filter(d => { const s = sbuStats[d['Group SBU/SFU']||'Unknown']; return s?.total > 0 && s.total === s.evaluated; });
    if (allScoredFilter)
      data = data.filter(d => d._hasHRBP && d._hasSME && d._hasAcademy);
    if (topicFilter)
      data = data.filter(d => (d['Training Topic']||'').toLowerCase().includes(topicFilter.toLowerCase()));
    if (sbuFilter)
      data = data.filter(d => (d['Group SBU/SFU']||'').toLowerCase().includes(sbuFilter.toLowerCase()));
    if (hrbpFilter)
      data = data.filter(d => getHrbp(d).toLowerCase().includes(hrbpFilter.toLowerCase()));
    return data;
  }, [parsedData, topicFilter, sbuFilter, hrbpFilter, completeSbuOnly, allScoredFilter, sbuStats]);

  const metrics = useMemo(() => {
    const data = globallyFilteredData;
    let scores = [], sbuMap = {};
    const cat = { theory:[], accuracy:[], relevance:[], practical:[], visual:[], eval:[], qa:[] };
    let pass=0, refine=0, pending=0, hrbp=0, sme=0, acd=0;
    data.forEach(d => {
      const sbu = d['Group SBU/SFU'] || 'Unknown';
      if (!sbuMap[sbu]) sbuMap[sbu] = { name:sbu, sum:0, valid:0, total:0 };
      sbuMap[sbu].total++;
      if (d._TotalScore !== null) {
        scores.push({ topic: d['Training Topic'], score: d._TotalScore });
        sbuMap[sbu].sum += d._TotalScore;
        sbuMap[sbu].valid++;
        if (d._TotalScore >= 8) pass++; else refine++;
      } else pending++;
      if (d._Theory)    cat.theory.push(d._Theory);
      if (d._Accuracy)  cat.accuracy.push(d._Accuracy);
      if (d._Relevance) cat.relevance.push(d._Relevance);
      if (d._Practical) cat.practical.push(d._Practical);
      if (d._Visual)    cat.visual.push(d._Visual);
      if (d._Eval)      cat.eval.push(d._Eval);
      if (d._QA)        cat.qa.push(d._QA);
      if (d._hasHRBP)   hrbp++;
      if (d._hasSME)    sme++;
      if (d._hasAcademy) acd++;
    });
    const avg = arr => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(2) : '0';
    const sbuSummary = Object.values(sbuMap)
      .map(s => ({ ...s, avg: s.valid>0?parseFloat((s.sum/s.valid).toFixed(2)):0, completeness: s.total>0?((s.valid/s.total)*100).toFixed(1):'0' }))
      .sort((a,b) => b.avg-a.avg);
    scores.sort((a,b) => a.score-b.score);
    return {
      total: data.length, scored: scores.length, pending, pass, refine,
      hrbpEvalCount: hrbp, smeEvalCount: sme, academyEvalCount: acd,
      completeness: data.length ? ((scores.length/data.length)*100).toFixed(1) : '0',
      avg: avg(scores.map(v=>v.score)),
      highest: scores[scores.length-1],
      lowest: scores[0],
      sbuSummary,
      categories: [
        { name:'THEORY',     val: avg(cat.theory)    },
        { name:'ACCURACY',   val: avg(cat.accuracy)  },
        { name:'RELEVANCE',  val: avg(cat.relevance) },
        { name:'PRACTICAL',  val: avg(cat.practical) },
        { name:'VISUAL',     val: avg(cat.visual)    },
        { name:'EVALUATION', val: avg(cat.eval)      },
        { name:'Q&A',        val: avg(cat.qa)        },
      ],
    };
  }, [globallyFilteredData]);

  const activeSBUs = metrics.sbuSummary.filter(s => s.valid > 0);
  const top5SBUs   = activeSBUs.slice(0,5);
  const otherSBUs  = activeSBUs.slice(5);
  const zeroSBUs   = metrics.sbuSummary.filter(s => s.valid===0 && s.total>0);

  const tableData = useMemo(() => {
    let d = globallyFilteredData;
    if (tableView==='scored') d = d.filter(r => r._TotalScore!==null);
    else d = d.filter(r => r._TotalScore===null);
    if (!scoreFilters.includes('all')) {
      d = d.filter(r => {
        let m=false;
        if (scoreFilters.includes('pass')   && r._TotalScore>=8)                   m=true;
        if (scoreFilters.includes('refine') && r._TotalScore!==null && r._TotalScore<8) m=true;
        return m;
      });
    }
    if (!evaluatorFilters.includes('all')) {
      d = d.filter(r => evaluatorFilters.every(f => {
        if (f==='hrbp')          return r._hasHRBP;
        if (f==='sme')           return r._hasSME;
        if (f==='academy')       return r._hasAcademy;
        if (f==='all_completed') return r._hasHRBP && r._hasSME && r._hasAcademy;
        return true;
      }));
    }
    if (sortOrder==='highest') d=[...d].sort((a,b)=>(b._TotalScore||0)-(a._TotalScore||0));
    if (sortOrder==='lowest')  d=[...d].sort((a,b)=>(a._TotalScore||100)-(b._TotalScore||100));
    return d;
  }, [globallyFilteredData, tableView, scoreFilters, evaluatorFilters, sortOrder]);

  const handleToggleFilter = (id, current, setter) => {
    if (id==='all') { setter(['all']); return; }
    let next = current.filter(i=>i!=='all');
    if (next.includes(id)) { next=next.filter(i=>i!==id); if(!next.length) next=['all']; }
    else next.push(id);
    setter(next);
  };

  const handleSaveToCloud = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db,'artifacts',APP_ID,'public','data','dashboard','tsv_data'),
        { tsvData:rawData, updatedAt:new Date().toISOString(), updatedBy:user.uid });
      setActiveTab('simplifikasi');
    } catch { setSyncError('Save Failed'); }
    finally { setIsSaving(false); }
  };

  const handleExportTable = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rawData],{type:'text/tsv'}));
    a.download = 'Meratus_CCT_Export.tsv';
    a.click();
  };

  const handleDownloadPDF = async () => {
    const el = document.getElementById('pdf-one-pager');
    if (!el) return;
    setIsDownloading(true);
    const orig = el.style.cssText;
    el.style.cssText = 'width:1120px;min-width:1120px;max-width:1120px;margin:0 auto;';
    const bg = isDarkMode ? '#020617' : '#f1f5f9';
    const opt = {
      margin:0.2, filename:'Meratus_CCT_OnePager.pdf',
      image:{type:'jpeg',quality:1},
      html2canvas:{scale:2,useCORS:true,logging:false,windowWidth:1120,x:0,y:0,backgroundColor:bg},
      jsPDF:{unit:'in',format:'a4',orientation:'landscape'},
    };
    const done = () => { el.style.cssText=orig; setIsDownloading(false); };
    if (!window.html2pdf) {
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      s.onload=()=>window.html2pdf().set(opt).from(el).save().then(done).catch(done);
      document.head.appendChild(s);
    } else window.html2pdf().set(opt).from(el).save().then(done).catch(done);
  };

  const isAnyFilterActive = !!(topicFilter||sbuFilter||hrbpFilter||completeSbuOnly||allScoredFilter);
  const clearAllFilters = () => { setTopicFilter(''); setSbuFilter(''); setHrbpFilter(''); setCompleteSbuOnly(false); setAllScoredFilter(false); };
  const allScoredCount = useMemo(() => parsedData.filter(d=>d._hasHRBP&&d._hasSME&&d._hasAcademy).length, [parsedData]);

  const getSubScoreStyle = score => {
    if (!score||score==='-') return tc.subScoreNormal;
    return parseFloat(score)<8 ? tc.subScoreLow : tc.subScoreNormal;
  };

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className={`min-h-screen font-sans selection:bg-blue-900 selection:text-blue-100 ${tc.root}`}>

      {/* NAV */}
      <nav className={`shadow-lg sticky top-0 z-50 border-b print:hidden transition-colors duration-200 ${tc.nav}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 md:py-0 md:h-[72px]">

            {/* Brand */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2.5 rounded-xl shadow-lg shadow-blue-900/30">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className={`font-bold text-sm tracking-wide uppercase leading-tight ${tc.navTitle}`}>
                  Meratus Academy: NEW CCT Evaluations
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${tc.navSyncDot(syncError)} ${!syncError?'animate-pulse':''}`}/>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${tc.navSync}`}>
                    {syncError || 'Cloud Sync Active'}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Theme toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className={`p-2 rounded-lg border transition-colors flex-shrink-0 ${tc.navThemeBtn}`}
              >
                {isDarkMode ? <Sun size={16} className="text-amber-400"/> : <Moon size={16} className="text-indigo-500"/>}
              </button>

              {/* Tab bar */}
              <div className={`flex p-1.5 rounded-xl shadow-inner border backdrop-blur-sm overflow-x-auto ${tc.tabBar}`}>
                {[
                  { id:'simplifikasi', Icon:LayoutDashboard, label:'Simplified View' },
                  { id:'detail',       Icon:TableProperties,  label:'Detail View'      },
                  { id:'source',       Icon:Upload,             label:'Source Data'      },
                ].map(({ id, Icon, label }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${activeTab===id ? tc.tabActive : tc.tabInactive}`}
                  >
                    <Icon size={14}/> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* GLOBAL FILTERS BAR */}
      {(activeTab==='simplifikasi'||activeTab==='detail') && (
        <div className={`border-b shadow-sm sticky top-[72px] z-40 print:hidden transition-colors duration-200 ${tc.filtersBar}`}>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 mr-1">
              <Filter size={14} className="text-blue-500"/>
              <span className={`text-[11px] font-bold uppercase tracking-widest ${tc.filterLabel}`}>Global Filter:</span>
            </div>

            <GlobalSuggestionInput value={topicFilter} setValue={setTopicFilter} placeholder="Search Training Topic..." list={suggestions.topics} icon={Search} tc={tc}/>
            <GlobalSuggestionInput value={sbuFilter}   setValue={setSbuFilter}   placeholder="Filter SBU/SFU..."       list={suggestions.sbus}   icon={Building2} tc={tc}/>
            <GlobalSuggestionInput value={hrbpFilter}  setValue={setHrbpFilter}  placeholder="Filter HRBP..."          list={suggestions.hrbps}  icon={Users} tc={tc}/>

            {/* 100% Complete SBU */}
            <button onClick={() => setCompleteSbuOnly(!completeSbuOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors border ${tc.filterBtn(completeSbuOnly)}`}
            >
              <CheckCircle2 size={12} className={tc.filterBtnIcon(completeSbuOnly)}/>
              100% Complete SBU
            </button>

            {/* All 3 Scored */}
            <button onClick={() => setAllScoredFilter(!allScoredFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors border ${tc.filterBtnAllScored(allScoredFilter)}`}
            >
              <Users size={12} className={tc.filterBtnIconViolet(allScoredFilter)}/>
              All 3 Scored
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black ${tc.allScoredBadge(allScoredFilter)}`}>
                {allScoredCount}
              </span>
            </button>

            {isAnyFilterActive && (
              <button onClick={clearAllFilters} className={`text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase tracking-widest transition-colors border shadow-sm ${tc.clearBtn}`}>
                <X size={12}/> Clear
              </button>
            )}

            {activeTab==='simplifikasi' && (
              <button onClick={handleDownloadPDF} disabled={isDownloading}
                className={`ml-auto text-[11px] font-bold px-4 py-2 rounded-full flex items-center gap-2 uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 ${tc.pdfBtn}`}
              >
                {isDownloading ? <RefreshCw size={14} className="animate-spin"/> : <Printer size={14}/>}
                {isDownloading ? 'Processing...' : 'Download PDF'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">

        {/* Loading */}
        {isLoadingData ? (
          <div className="h-[70vh] flex flex-col items-center justify-center animate-in fade-in duration-500 print:hidden">
            <RefreshCw className="h-10 w-10 animate-spin mb-4 text-blue-500"/>
            <p className={`font-semibold text-xs tracking-widest uppercase animate-pulse ${tc.loadingText}`}>Loading Data...</p>
          </div>

        /* ─── SIMPLIFIED VIEW ─────────────────────────────────────── */
        ) : activeTab==='simplifikasi' ? (
          <div id="pdf-one-pager" className={`flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-100 text-slate-900'}`}>

            {/* Row 1 – 4 metric cards */}
            <div className="grid grid-cols-4 gap-3">
              {/* Completeness */}
              <div className={`p-3.5 rounded-xl border shadow-sm flex flex-col justify-between relative overflow-hidden h-[100px] ${tc.card}`}>
                <div className={`absolute top-3 right-3 bg-opacity-50 rounded-full p-1.5 border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                  <CheckCircle2 size={24} className={isDarkMode?'text-slate-600':'text-slate-300'}/>
                </div>
                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"/> 1. COMPLETENESS
                </p>
                <h3 className={`text-3xl font-black tracking-tighter relative z-10 ${isDarkMode?'text-slate-100':'text-slate-800'}`}>{metrics.completeness}%</h3>
                <div className={`w-2/3 h-1.5 rounded-full overflow-hidden relative z-10 mt-auto ${tc.catBarBg}`}>
                  <div className="bg-blue-500 h-full" style={{width:metrics.completeness+'%'}}/>
                </div>
              </div>

              {/* Global avg */}
              <div className={`p-3.5 rounded-xl border shadow-sm flex flex-col justify-between relative overflow-hidden h-[100px] ${tc.card}`}>
                <div className={`absolute top-3 right-3 rounded-lg p-1.5 border ${isDarkMode?'bg-slate-800/50 border-slate-700':'bg-slate-100 border-slate-200'}`}>
                  <BarChart3 size={24} className={isDarkMode?'text-slate-600':'text-slate-300'}/>
                </div>
                <p className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${parseFloat(metrics.avg)<8?'text-red-400':'text-emerald-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${parseFloat(metrics.avg)<8?'bg-red-500':'bg-emerald-500'}`}/> 2. GLOBAL AVERAGE
                </p>
                <h3 className={`text-3xl font-black tracking-tighter relative z-10 ${parseFloat(metrics.avg)<8?'text-red-400':'text-emerald-400'}`}>{metrics.avg}</h3>
                <p className={`text-[8px] font-bold uppercase tracking-widest relative z-10 border-t pt-1.5 mt-auto ${tc.metricLabel} ${tc.divider}`}>AVERAGE MODULE SCORE</p>
              </div>

              {/* Highest */}
              <div className={`p-3.5 rounded-xl border shadow-sm flex flex-col justify-between h-[100px] ${tc.card}`}>
                <div className="flex justify-between items-start">
                  <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"/> 3. HIGHEST SCORE
                  </p>
                  <span className={`text-xl font-black px-2.5 py-0.5 rounded border ${isDarkMode?'text-slate-100 bg-blue-900/30 border-blue-800/50':'text-blue-700 bg-blue-50 border-blue-200'}`}>
                    {metrics.highest?.score||'-'}
                  </span>
                </div>
                <div className={`mt-2 border-t pt-2 flex-1 flex items-end ${tc.divider}`}>
                  <p className={`text-[10px] font-bold leading-tight line-clamp-2 ${isDarkMode?'text-slate-300':'text-slate-700'}`} title={metrics.highest?.topic}>{metrics.highest?.topic||'-'}</p>
                </div>
              </div>

              {/* Lowest */}
              <div className={`p-3.5 rounded-xl border shadow-sm flex flex-col justify-between h-[100px] ${metrics.lowest?.score<8?(isDarkMode?'border-red-900/50 bg-red-950/20':'border-red-200 bg-red-50/50'):tc.card}`}>
                <div className="flex justify-between items-start">
                  <p className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${metrics.lowest?.score<8?'text-red-400':'text-rose-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${metrics.lowest?.score<8?'bg-red-500':'bg-rose-500'}`}/> 4. LOWEST SCORE
                  </p>
                  <span className={`text-xl font-black px-2.5 py-0.5 rounded border ${metrics.lowest?.score<8?'text-white bg-red-600/80 border-red-500':(isDarkMode?'text-slate-200 bg-rose-900/30 border-rose-800/50':'text-rose-700 bg-rose-50 border-rose-200')}`}>
                    {metrics.lowest?.score||'-'}
                  </span>
                </div>
                <div className={`mt-2 border-t pt-2 flex-1 flex items-end ${metrics.lowest?.score<8?(isDarkMode?'border-red-900/50':'border-red-200'):tc.divider}`}>
                  <p className={`text-[10px] font-bold leading-tight line-clamp-2 ${isDarkMode?'text-slate-300':'text-slate-700'}`} title={metrics.lowest?.topic}>{metrics.lowest?.topic||'-'}</p>
                </div>
              </div>
            </div>

            {/* Row 2 – 4 stat pills */}
            <div className="grid grid-cols-4 gap-3">
              <div className={`border px-4 py-2 rounded-xl flex items-center justify-between shadow-sm h-[64px] ${isDarkMode?'bg-emerald-950/30 border-emerald-900/50':'bg-emerald-50 border-emerald-200'}`}>
                <div><span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block leading-none">5. PASS MODULE</span><span className="text-[8px] font-bold text-emerald-500/80 uppercase mt-1.5 block leading-none">SCORE &ge; 8.0</span></div>
                <span className="text-xl font-black text-emerald-500 leading-none">{metrics.pass}</span>
              </div>
              <div className={`border px-4 py-2 rounded-xl flex items-center justify-between shadow-sm h-[64px] ${isDarkMode?'bg-red-950/30 border-red-900/50':'bg-red-50 border-red-200'}`}>
                <div><span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block leading-none">6. REFINED MODULE</span><span className="text-[8px] font-bold text-red-500/80 uppercase mt-1.5 block leading-none">SCORE &lt; 8.0</span></div>
                <span className="text-xl font-black text-red-500 leading-none">{metrics.refine}</span>
              </div>
              <div className={`border px-4 py-2 rounded-xl flex items-center justify-between shadow-sm h-[64px] ${isDarkMode?'bg-amber-950/30 border-amber-900/50':'bg-amber-50 border-amber-200'}`}>
                <div><span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block leading-none">7. PENDING REVIEW</span><span className="text-[8px] font-bold text-amber-500/80 uppercase mt-1.5 block leading-none">NOT YET EVALUATED</span></div>
                <span className="text-xl font-black text-amber-500 leading-none">{metrics.pending}</span>
              </div>
              <div className={`border px-4 py-2 rounded-xl flex flex-col justify-center shadow-sm h-[64px] gap-1 ${isDarkMode?'bg-blue-950/30 border-blue-900/50':'bg-blue-50 border-blue-200'}`}>
                <div className="flex justify-between items-center w-full">
                  <div><span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block leading-none">8. TOTAL EVALUATED</span><span className="text-[8px] font-bold text-blue-500/80 uppercase mt-1 block leading-none">FROM {metrics.total} MODULES</span></div>
                  <span className="text-xl font-black text-blue-500 leading-none">{metrics.scored}</span>
                </div>
                <div className={`flex justify-between items-center text-[8px] font-bold text-blue-400 px-2 py-0.5 rounded mt-0.5 border ${isDarkMode?'bg-blue-900/40 border-blue-800/50':'bg-blue-100 border-blue-200'}`}>
                  <span className="flex items-center gap-1">HRBP <span className={isDarkMode?'text-blue-200':'text-blue-600'}>{metrics.hrbpEvalCount}</span></span>
                  <span className="flex items-center gap-1">SME  <span className={isDarkMode?'text-blue-200':'text-blue-600'}>{metrics.smeEvalCount}</span></span>
                  <span className="flex items-center gap-1">ACD  <span className={isDarkMode?'text-blue-200':'text-blue-600'}>{metrics.academyEvalCount}</span></span>
                </div>
              </div>
            </div>

            {/* Row 3 – Category + SBU */}
            <div className="grid grid-cols-12 gap-3 items-stretch flex-1">
              {/* Category panel */}
              <div className={`col-span-12 lg:col-span-3 rounded-xl p-4 shadow-md flex flex-col border h-full ${tc.catPanel}`}>
                <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${tc.divider}`}>
                  <BookOpen size={14} className={tc.sectionTitle}/>
                  <h3 className={`text-[10px] font-bold tracking-widest uppercase ${tc.sectionTitle}`}>9. CATEGORY PERFORMANCE</h3>
                </div>
                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  {metrics.categories.map((cat,i) => (
                    <div key={i}>
                      <div className="flex justify-between items-end mb-1">
                        <span className={`text-[9px] font-bold uppercase tracking-widest leading-none ${isDarkMode?'text-slate-400':'text-slate-500'}`}>{cat.name}</span>
                        <span className={`text-[10px] font-black leading-none ${parseFloat(cat.val)<8?'text-red-400':'text-amber-500'}`}>{cat.val}</span>
                      </div>
                      <div className={`w-full h-1 rounded-full overflow-hidden ${tc.catBarBg}`}>
                        <div className={`h-full rounded-full ${parseFloat(cat.val)<8?'bg-red-500':'bg-amber-400'}`} style={{width:parseFloat(cat.val)*10+'%'}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SBU panel */}
              <div className={`col-span-12 lg:col-span-9 rounded-xl border shadow-sm flex flex-col h-full ${tc.card}`}>
                <div className={`px-4 py-2.5 border-b flex items-center justify-between ${tc.divider}`}>
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${tc.sbuHeaderWrap}`}><Building2 className={`h-3.5 w-3.5 ${tc.sbuHeaderIcon}`}/></div>
                    <h2 className={`text-[10px] font-bold uppercase tracking-widest ${tc.sbuHeaderTitle}`}>10. PERFORMANCE & PROGRESS PER SBU/SFU UNIT</h2>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${tc.sbuCountBadge}`}>{metrics.sbuSummary.length} Total Units</span>
                </div>
                <div className={`p-3 flex-1 flex flex-col rounded-b-xl ${tc.cardSubBg}`}>
                  {/* Top 5 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-3">
                    {top5SBUs.map((s,i) => (
                      <div key={i} className={`border rounded-lg p-2.5 pl-3 flex flex-col relative overflow-hidden shadow-sm h-[60px] justify-between ${s.avg<8?(isDarkMode?'border-red-900/50 bg-slate-900':'border-red-200 bg-white'):tc.sbuCardBg}`}>
                        <div className={`absolute top-0 left-0 w-1 h-full ${s.avg>=8?'bg-emerald-500':'bg-red-500'}`}/>
                        <div className="flex justify-between items-start w-full gap-1">
                          <span className={`text-[9px] font-bold uppercase leading-none truncate flex-1 ${isDarkMode?'text-slate-300':'text-slate-600'}`} title={s.name}>{s.name}</span>
                          <span className={`text-[8px] font-bold leading-none ${isDarkMode?'text-slate-500':'text-slate-400'}`}>{s.completeness}%</span>
                        </div>
                        <div className="flex items-end justify-between mt-auto w-full">
                          <span className={`text-base font-black leading-none ${s.avg>=8?'text-emerald-500':'text-red-500'}`}>{s.avg}</span>
                          <div className={`w-10 h-1 rounded-full overflow-hidden mb-0.5 ${tc.catBarBg}`}>
                            <div className="bg-blue-500 h-full" style={{width:s.completeness+'%'}}/>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Others */}
                  {otherSBUs.length>0 && (
                    <div className={`mb-3 border-b pb-3 ${tc.divider}`}>
                      <div className="flex items-center gap-1.5 mb-1.5"><BarChart3 className={tc.metricLabel} size={12}/><span className={`text-[9px] font-bold uppercase tracking-wider ${isDarkMode?'text-slate-400':'text-slate-500'}`}>OTHER UNITS</span></div>
                      <div className="flex flex-wrap gap-1.5">
                        {otherSBUs.map((s,i) => (
                          <div key={i} className={`text-[9px] font-bold px-2 py-1 rounded border flex items-center gap-1.5 shadow-sm ${s.avg<8?(isDarkMode?'border-red-900/50 bg-red-950/30':'border-red-200 bg-red-50'):tc.sbuOtherBg}`}>
                            <span className={`max-w-[120px] truncate ${s.avg<8?'text-red-400':tc.sbuOtherBg.split(' ').find(c=>c.startsWith('text-'))}`} title={s.name}>{s.name}</span>
                            <div className={`h-3 w-px mx-0.5 ${tc.sbuOtherDivider}`}/>
                            <span className={`font-black ${s.avg>=8?'text-emerald-500':'text-red-500'}`}>{s.avg}</span>
                            <span className={isDarkMode?'text-slate-500':'text-slate-400'}>({s.completeness}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Pending */}
                  {zeroSBUs.length>0 && (
                    <div className={`mt-auto border border-dashed rounded-lg p-2 ${tc.sbuPendingWrap}`}>
                      <div className="flex items-center gap-1.5 mb-1.5"><Layers className={isDarkMode?'text-slate-500':'text-slate-400'} size={12}/><span className={`text-[9px] font-bold uppercase tracking-wider ${isDarkMode?'text-slate-400':'text-slate-500'}`}>NO EVALUATION YET (PENDING)</span></div>
                      <div className="flex flex-wrap gap-1.5">
                        {zeroSBUs.map((s,i) => (
                          <div key={i} className={`text-[8px] font-bold px-1.5 py-1 rounded border flex items-center gap-1 shadow-sm ${tc.sbuPendingChip}`}>
                            {s.name} <span className={`px-1 py-0.5 rounded-sm ${tc.sbuPendingNum}`}>{s.total}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        /* ─── DETAIL VIEW ──────────────────────────────────────────── */
        ) : activeTab==='detail' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className={`rounded-[2rem] border shadow-sm flex flex-col mb-10 overflow-visible ${tc.tableSection}`}>

              {/* Table header controls */}
              <div className={`flex flex-col md:flex-row border-b rounded-t-[2rem] overflow-visible ${tc.divider} ${isDarkMode?'bg-slate-900':'bg-white'}`}>
                <div className="flex overflow-x-auto no-scrollbar flex-1">
                  <button onClick={() => setTableView('scored')}
                    className={`px-8 py-5 text-xs font-bold uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${tableView==='scored' ? tc.tableTabActive('scored') : tc.tableTabInactive}`}>
                    Evaluated ({metrics.scored})
                  </button>
                  <button onClick={() => setTableView('unscored')}
                    className={`px-8 py-5 text-xs font-bold uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${tableView==='unscored' ? tc.tableTabActive('unscored') : tc.tableTabInactive}`}>
                    Pending Review ({metrics.pending})
                  </button>
                </div>

                <div className={`flex flex-wrap items-center px-4 py-3 md:py-0 border-t md:border-t-0 gap-3 z-10 w-full md:w-auto overflow-visible rounded-tr-[2rem] ${tc.divider} ${isDarkMode?'bg-slate-900':'bg-white'}`}>
                  <div className={`flex items-center gap-2 mr-2 border-r pr-4 overflow-visible ${tc.divider}`}>
                    <MultiSelectDropdown label="Score" tc={tc}
                      options={[{id:'all',label:'All Score'},{id:'pass',label:'Score ≥ 8'},{id:'refine',label:'Score < 8'}]}
                      selectedValues={scoreFilters} onToggle={id=>handleToggleFilter(id,scoreFilters,setScoreFilters)}/>
                    <MultiSelectDropdown label="Evaluator" tc={tc}
                      options={[{id:'all',label:'All Evaluators'},{id:'hrbp',label:'Has HRBP Score'},{id:'sme',label:'Has SME Score'},{id:'academy',label:'Has Academy Score'},{id:'all_completed',label:'All Roles Completed'}]}
                      selectedValues={evaluatorFilters} onToggle={id=>handleToggleFilter(id,evaluatorFilters,setEvaluatorFilters)}/>
                    <select value={sortOrder} onChange={e=>setSortOrder(e.target.value)}
                      className={`border text-[10px] font-bold uppercase rounded-lg px-2 py-2 outline-none focus:ring-2 focus:ring-blue-500 h-[34px] ${tc.ddSelectCls}`}>
                      <option value="none">Sort: Default</option>
                      <option value="highest">Highest Score</option>
                      <option value="lowest">Lowest Score</option>
                    </select>
                  </div>
                  {/* NEW TOGGLE ADDED HERE */}
                  <button onClick={()=>setShowChecklist(!showChecklist)} className={`text-[11px] font-bold flex items-center gap-2 uppercase tracking-widest transition-all px-4 py-2 rounded-xl ${tc.detailToggle(showChecklist)}`}>
                    {showChecklist?<EyeOff size={14}/>:<Eye size={14}/>} {showChecklist?'Hide Checklist':'Show Checklist'}
                  </button>
                  <button onClick={()=>setShowDetails(!showDetails)} className={`text-[11px] font-bold flex items-center gap-2 uppercase tracking-widest transition-all px-4 py-2 rounded-xl ${tc.detailToggle(showDetails)}`}>
                    {showDetails?<EyeOff size={14}/>:<Eye size={14}/>} {showDetails?'Compact View':'Detail View'}
                  </button>
                  <button onClick={handleExportTable} className={`text-[11px] font-bold flex items-center gap-2 uppercase tracking-widest transition-all px-4 py-2 rounded-xl shadow-sm ${tc.exportBtn}`}>
                    <Download size={14}/> Export Data
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className={`overflow-x-auto overflow-y-auto w-full custom-scrollbar max-h-[65vh] relative rounded-b-[2rem] ${isDarkMode?'bg-slate-900':'bg-white'}`} style={{zIndex:1}}>
                <table className="w-full text-left border-collapse">
                  <thead className={`sticky top-0 z-20 shadow-sm ring-1 backdrop-blur-sm ${tc.tableHead}`}>
                    <tr className="text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-4 whitespace-nowrap">No</th>
                      <th className="px-6 py-4 min-w-[250px] w-1/3">Training Topic</th>
                      <th className="px-6 py-4 whitespace-nowrap">Group SBU</th>
                      <th className="px-6 py-4 whitespace-nowrap">HRBP Name</th>
                      {showChecklist && (
                        <>
                          <th className={`px-4 py-4 whitespace-nowrap text-center text-blue-500 ${isDarkMode?'bg-blue-900/20':'bg-blue-50'}`}>HRBP</th>
                          <th className={`px-4 py-4 whitespace-nowrap text-center text-blue-500 ${isDarkMode?'bg-blue-900/20':'bg-blue-50'}`}>SME</th>
                          <th className={`px-4 py-4 whitespace-nowrap text-center text-blue-500 border-r ${isDarkMode?'bg-blue-900/20 border-slate-800':'bg-blue-50 border-slate-200'}`}>ACD</th>
                        </>
                      )}
                      <th className={`px-6 py-4 whitespace-nowrap text-center ${isDarkMode?'bg-slate-800/50':'bg-slate-200/50'}`}>Score</th>
                      {showDetails && (<>
                        <th className={`px-4 py-4 whitespace-nowrap text-center border-l ${tc.tableBorder}`}>Theory</th>
                        <th className="px-4 py-4 whitespace-nowrap text-center">Accuracy</th>
                        <th className="px-4 py-4 whitespace-nowrap text-center">Relevance</th>
                        <th className="px-4 py-4 whitespace-nowrap text-center">Practical</th>
                        <th className="px-4 py-4 whitespace-nowrap text-center">Visual</th>
                        <th className="px-4 py-4 whitespace-nowrap text-center">Evaluation</th>
                        <th className="px-4 py-4 whitespace-nowrap text-center">Q&A</th>
                      </>)}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tc.tableBorder}`}>
                    {tableData.map((row,idx) => {
                      const link = resolveLink(row['Training Topic']);
                      return (
                        <tr key={idx} className={`transition-colors group ${idx%2===1?tc.tableRowAlt:''} ${tc.tableRowHover}`}>
                          <td className={`px-6 py-4 text-xs font-semibold whitespace-nowrap ${tc.tableCellMuted}`}>{row['NO']||'-'}</td>
                          <td className="px-6 py-4">
                            {link
                              ? <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline line-clamp-2 transition-colors" title={row['Training Topic']}>{row['Training Topic']||'-'}</a>
                              : <div className={`text-xs font-bold line-clamp-2 ${tc.tableCellMain}`} title={row['Training Topic']}>{row['Training Topic']||'-'}</div>
                            }
                          </td>
                          <td className={`px-6 py-4 text-xs font-semibold whitespace-nowrap ${tc.tableCellMuted}`}>{row['Group SBU/SFU']||'-'}</td>
                          <td className={`px-6 py-4 text-xs font-semibold whitespace-nowrap ${tc.tableCellMuted}`}>{getHrbp(row)||'-'}</td>
                          {showChecklist && (
                            <>
                              <td className="px-4 py-4 text-center">{row._hasHRBP?<CheckCircle2 size={16} className="text-blue-500 mx-auto"/>:<span className={tc.tableCellMuted}>-</span>}</td>
                              <td className="px-4 py-4 text-center">{row._hasSME?<CheckCircle2 size={16} className="text-blue-500 mx-auto"/>:<span className={tc.tableCellMuted}>-</span>}</td>
                              <td className={`px-4 py-4 text-center border-r ${tc.tableBorder}`}>{row._hasAcademy?<CheckCircle2 size={16} className="text-blue-500 mx-auto"/>:<span className={tc.tableCellMuted}>-</span>}</td>
                            </>
                          )}
                          <td className="px-6 py-4 text-center">
                            {row._TotalScore!==null
                              ? <span className={`inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm border ${row._TotalScore>=8?'bg-emerald-900/50 text-emerald-400 border-emerald-800':'bg-red-600 text-white border-red-700'}`}>{row._TotalScore}</span>
                              : <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border ${tc.pendingBadge}`}>Pending</span>
                            }
                          </td>
                          {showDetails && (<>
                            <td className={`px-4 py-4 text-xs text-center font-bold border-l ${tc.tableBorder} ${getSubScoreStyle(row._Theory)}`}>{row._Theory||'-'}</td>
                            <td className={`px-4 py-4 text-xs text-center font-bold ${getSubScoreStyle(row._Accuracy)}`}>{row._Accuracy||'-'}</td>
                            <td className={`px-4 py-4 text-xs text-center font-bold ${getSubScoreStyle(row._Relevance)}`}>{row._Relevance||'-'}</td>
                            <td className={`px-4 py-4 text-xs text-center font-bold ${getSubScoreStyle(row._Practical)}`}>{row._Practical||'-'}</td>
                            <td className={`px-4 py-4 text-xs text-center font-bold ${getSubScoreStyle(row._Visual)}`}>{row._Visual||'-'}</td>
                            <td className={`px-4 py-4 text-xs text-center font-bold ${getSubScoreStyle(row._Eval)}`}>{row._Eval||'-'}</td>
                            <td className={`px-4 py-4 text-xs text-center font-bold ${getSubScoreStyle(row._QA)}`}>{row._QA||'-'}</td>
                          </>)}
                        </tr>
                      );
                    })}
                    {tableData.length===0 && (
                      <tr><td colSpan={5 + (showChecklist ? 3 : 0) + (showDetails ? 7 : 0)} className={`px-6 py-20 text-center ${isDarkMode?'bg-slate-900/50':'bg-white'}`}>
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className={`p-4 rounded-full shadow-sm border ${tc.noDataIcon}`}><AlertCircle size={32} className={tc.metricLabel}/></div>
                          <div>
                            <p className={`text-sm font-bold ${tc.noDataTitle}`}>No data found</p>
                            <p className={`text-xs font-semibold mt-1 ${tc.noDataSub}`}>Adjust the filter keywords above.</p>
                          </div>
                        </div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

        /* ─── SOURCE DATA ──────────────────────────────────────────── */
        ) : (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`rounded-[2rem] border shadow-sm overflow-hidden ${tc.sourceCard}`}>
              {!isAuthorized ? (
                <div className={`p-12 flex flex-col items-center justify-center text-center py-24 ${tc.lockBg}`}>
                  <div className={`p-5 rounded-full mb-6 border shadow-inner ${tc.lockIcon}`}><Lock size={36} className={tc.metricLabel}/></div>
                  <h2 className={`text-xl font-black mb-2 tracking-tight ${tc.lockTitle}`}>Access Locked</h2>
                  <p className={`text-sm font-semibold mb-8 max-w-sm ${tc.lockSub}`}>Enter administration password to update raw data (TSV).</p>
                  <div className="flex w-full max-w-sm gap-3">
                    <div className="relative flex-1">
                      <input
                        type={showPassword?'text':'password'} value={passwordInput}
                        onChange={e=>setPasswordInput(e.target.value)}
                        onKeyDown={e=>{ if(e.key==='Enter'){ if(passwordInput==='MeratusAcademy') setIsAuthorized(true); else alert('Incorrect Password!'); }}}
                        placeholder="Enter Password..."
                        className={`w-full border px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10 shadow-sm ${tc.lockInput}`}
                      />
                      <button onClick={()=>setShowPassword(!showPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 ${tc.lockEyeBtn}`}>
                        {showPassword?<EyeOff size={16}/>:<Eye size={16}/>}
                      </button>
                    </div>
                    <button onClick={()=>{ if(passwordInput==='MeratusAcademy') setIsAuthorized(true); else alert('Incorrect Password!'); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95">Unlock</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`px-8 py-6 border-b flex items-center justify-between ${tc.sourceHeader} ${tc.divider}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${isDarkMode?'bg-indigo-900/50 text-indigo-400':'bg-indigo-50 text-indigo-600'}`}><FileSpreadsheet size={20}/></div>
                      <div>
                        <h2 className={`text-base font-bold ${tc.sourceLabel}`}>Data Source (TSV)</h2>
                        <p className={`text-xs font-semibold mt-0.5 ${tc.sourceSub}`}>Paste raw TSV data from spreadsheet here</p>
                      </div>
                    </div>
                    <button onClick={handleSaveToCloud} disabled={isSaving}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-70 active:scale-95 ${tc.saveBtn}`}>
                      {isSaving?<RefreshCw className="animate-spin" size={18}/>:<Save size={18}/>}
                      {isSaving?'Saving...':'Save & Update'}
                    </button>
                  </div>
                  <div className={`p-6 ${isDarkMode?'bg-slate-900':'bg-white'}`}>
                    <textarea value={rawData} onChange={e=>setRawData(e.target.value)}
                      className={`w-full h-[60vh] border shadow-inner rounded-xl p-4 text-[11px] font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none custom-scrollbar whitespace-pre ${tc.textareaBase}`}
                      spellCheck="false"/>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}} />
    </div>
  );
}