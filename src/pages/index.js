import { useRef, useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@components/Layout';
import Container from '@components/Container';
import Map from '@components/Map';
import Button from '@components/Button';
import PersonCard from '@components/Card/PersonCard';
import styles from '@styles/Home.module.scss';
import { icon } from '@fortawesome/fontawesome-svg-core'; 
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChessPawn, faChessKnight, faChessRook, faUsers, faSatelliteDish, faPeopleGroup, faLandmarkDome, faTents } from '@fortawesome/free-solid-svg-icons';


// Add icons to the FontAwesome library
library.add(faChessPawn, faChessKnight, faChessRook, faUsers, faSatelliteDish, faPeopleGroup, faLandmarkDome,faTents);

// Get app title from environment variables
const appTitle = process.env.NEXT_PUBLIC_APP_TITLE;

// BERLIN BERLIN IST UMZINGELT
const DEFAULT_CENTER = [52.5214295, 13.4136877];

const getIcon = (person, orgName) => {
  // Default FontAwesome icon for fallback
  const defaultIcon = 'fas fa-chess-pawn';

  // List of organizations and their corresponding icon classes
  const organizationsData = [
    { name: 'AfD', type: 'party', icon: 'fas fa-chess-pawn' },
    { name: 'III_Weg', type: 'party', icon: 'fas fa-chess-pawn' },
    { name: 'WU', type: 'party', icon: 'fas fa-chess-pawn' },
    { name: 'Media', type: 'organization', icon: 'fas fa-chess-pawn' },
    { name: 'Fraternities', type: 'association', icon: 'fas fa-chess-pawn' },
    { name: 'Associations', type: 'association', icon: 'fas fa-chess-pawn' },
    { name: 'Settlers', type: 'association', icon: 'fas fa-chess-pawn' },
  ];

  // Generate the correct HTML for the icon based on the person's type
  let iconHtml;
  switch (person.type) {
    case 'nation':
      iconHtml = icon({ prefix: 'fas', iconName: 'chess-knight' }).html;
      break;
    case 'state':
      iconHtml = icon({ prefix: 'fas', iconName: 'chess-rook' }).html;
      break;
    case 'district':
      iconHtml = icon({ prefix: 'fas', iconName: 'chess-pawn' }).html;
      break;
    case 'entity':
      switch (orgName) {
        case organizationsData[3].name:
          iconHtml = icon({ prefix: 'fas', iconName: 'satellite-dish' }).html;
          break;
        case organizationsData[4].name:
          iconHtml = icon({ prefix: 'fas', iconName: 'people-group' }).html;
          break;
        case organizationsData[5].name:
          iconHtml = icon({ prefix: 'fas', iconName: 'landmark-dome' }).html;
          break;
        case organizationsData[6].name:
          iconHtml = icon({ prefix: 'fas', iconName: 'tents' }).html;
          break;
      }
  }

  // Return a new DivIcon with the generated HTML and necessary options
  return new L.DivIcon({
    className: `${person.type} 
                ${orgName.toLowerCase()} 
                invert
                flex`,
    iconSize: [14, 14],
    iconAnchor: [7, 7], // Adjust the anchor point
    popupAnchor: [0, -10], // Popup anchor above the marker
    html: iconHtml,
  });
};



export default function Home() {
  const [visibleParties, setVisibleParties] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [socialMedia, setSocialMedia] = useState([]);

  // Fetch data from API routes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [organizationsRes, personsRes, locationsRes, socialMediaRes] = await Promise.all([
          fetch('/api/organization').then((res) => res.json()),
          fetch('/api/person').then((res) => res.json()),
          fetch('/api/location').then((res) => res.json()),
          fetch('/api/socialmedia').then((res) => res.json()),
        ]);

        // Set organizations and initialize visibleParties
        setOrganizations(organizationsRes);
        setVisibleParties(
          organizationsRes.reduce((acc, org) => {
            acc[org.name] = true; // Initialize all organizations as visible
            return acc;
          }, {})
        );

        // Map locations by person_id
        const locationsMap = locationsRes.reduce((acc, location) => {
          acc[location.person_id] = [location.lat, location.lon];
          return acc;
        }, {});

        // Map social media by person_id
        const socialMediaMap = socialMediaRes.reduce((acc, sm) => {
          if (!acc[sm.person_id]) {
            acc[sm.person_id] = [];
          }
          acc[sm.person_id].push({ type: sm.type, url: sm.url });
          return acc;
        }, {});

        // Combine persons with their organizations
        const personsWithOrganizations = personsRes.map((person) => {
          const organization = organizationsRes.find(org => org.id === person.organization_id);
          return { ...person, organization };
        });

        setLocations(locationsMap);
        setSocialMedia(socialMediaMap);
        setCandidates(personsWithOrganizations);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Filter candidates based on the search query dynamically
  const filteredCandidates = candidates.filter(person => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    // Iterate through all fields of the candidate object
    return Object.entries(person).some(([key, value]) => {
      if (value) {
        if (typeof value === 'string' || typeof value === 'number') {
          // Convert value to string and compare with the search query
          return value.toString().toLowerCase().includes(lowerSearchQuery);
        } else if (Array.isArray(value)) {
          // If the field is an array (like social media), check its contents
          return value.some(item => 
            typeof item === 'object'
              ? Object.values(item).some(v => v.toString().toLowerCase().includes(lowerSearchQuery))
              : item.toString().toLowerCase().includes(lowerSearchQuery)
          );
        }
      }
      return false;
    });
  });

  // Function to toggle organization visibility
  const toggleParty = (orgName) => {
    setVisibleParties((prevState) => ({
      ...prevState,
      [orgName]: !prevState[orgName],
    }));
  };



  return (
    <Layout>
      <Head>
        <title>{appTitle}</title>
        <meta name="description" content="Overview of politicians and their corresponding electoral districts." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <Container>      
          {/* Search input field */}
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              className={styles.inputText}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Organization controls */}
          <div className={styles.partyControls}>
            {organizations.map((org) => (
              <Button key={org.id} onClick={() => toggleParty(org.name)}>
                {visibleParties[org.name] ? org.name : org.name}
              </Button>
            ))}
          </div>

          {/* Map Component */}
          <Map className={styles.homeMap} center={DEFAULT_CENTER} zoom={8}>
            {({ Marker, Popup, Tooltip }) => (
              <>
                {/* Display markers for each person / legal entity */}
                {filteredCandidates.map((person, index) => {
                  const position = locations[person.id];
                  const orgName = person.organization?.name;
                  const socialLinks = socialMedia[person.id] || [];

                  return position && visibleParties[orgName] ? (
                    <Marker 
                      key={index} 
                      position={position} 
                      icon={getIcon(person, orgName)}
                    >
                      <Tooltip>{person.name} - {orgName}</Tooltip>
                      <Popup>
                        <PersonCard person={person} orgName={orgName} socialLinks={socialLinks} />
                      </Popup>
                    </Marker>
                  ) : null;
                })}
              </>
            )}
          </Map>
        </Container>
    </Layout>
  );
}
