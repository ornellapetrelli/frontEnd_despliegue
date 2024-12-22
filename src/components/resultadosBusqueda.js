import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Table, Button, Alert, Form } from 'react-bootstrap';
import './resultadosBusqueda.css';

const FlightSelection = () => {
  const location = useLocation();
  const { searchData } = location.state || { searchData: {} };

  const [cart, setCart] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [flights, setFlights] = useState([]);
  const [noFlightsMessage, setNoFlightsMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (Object.keys(searchData).length === 0) {
      return;
    }

    const fetchFlights = async () => {
      try {
        console.log('Enviando parámetros de búsqueda al backend:', searchData);

        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/vuelos/flights?origin=${encodeURIComponent(searchData.origin)}&destination=${encodeURIComponent(searchData.destination)}&departureDate=${encodeURIComponent(searchData.departureDate)}`
        );
        //&returnDate=${encodeURIComponent(searchData.returnDate)}
        console.log('Datos de búsqueda:', searchData);
        console.log(`URL de la solicitud: ${response}`);

        if (!response.ok) {
          throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.length === 0) {
          setNoFlightsMessage('No se encontraron vuelos disponibles para esta búsqueda.');
        } else {
          setFlights(data);
          setNoFlightsMessage('');
        }
      } catch (error) {
        console.error('Error al obtener vuelos:', error);
        setNoFlightsMessage('Hubo un error al obtener los vuelos. Por favor, intenta más tarde.');
      }
    };

    fetchFlights();
  }, [searchData]);

  const handleSelectFlight = (flight) => {
    const updatedCart = [...cart, { ...flight, passengers: 1 }];
    setCart(updatedCart);
  };

  const handleEditSearch = () => {
    navigate('/', { state: { searchData } });
  };

  const handleRemoveFlight = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const handlePassengerChange = (index, value) => {
    const updatedCart = cart.map((flight, i) => {
      if (i === index) {
        return { ...flight, passengers: value };
      }
      return flight;
    });
    setCart(updatedCart);
  };
  const handlePayment = async () => {
    const authToken = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
  
    if (!authToken) {
      console.log('No token found, redirecting to login...');
      navigate('/Usuarios/login');
      return;
    }
  
    if (!userEmail) {
      console.log('No user email found.');
      return;
    }
  
    const paymentDetails = {
      flights: cart,
      totalPrice: cart.reduce((total, flight) => total + (flight.precio * flight.passengers), 0),
      email: userEmail,
    };
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/history/agregar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(paymentDetails),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('Correo enviado correctamente:', result);
        setAlertMessage('El correo fue enviado correctamente.');
      } else {
        const errorData = await response.json();
        console.error('Error del backend:', errorData);
        setAlertMessage(`Error del servidor: ${errorData.message || 'Error desconocido.'}`);
      }
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      setAlertMessage('Hubo un error al enviar el correo. Inténtalo nuevamente.');
    }
  };  
  
  

  return (
    <>
      <Container className="flight-selection-container">
        <h1 className="text-center mt-5 pt-5">Selecciona tu Vuelo</h1>
        <div className="search-details mb-4">
          <p><strong>Origen:</strong> {searchData.origin}</p>
          <p><strong>Destino:</strong> {searchData.destination}</p>
          <p><strong>Fecha de Ida:</strong> {searchData.departureDate}</p>
          {/* <p><strong>Fecha de Vuelta:</strong> {searchData.returnDate}</p> */}
          <Button variant="secondary" className="edit-button" onClick={handleEditSearch}>
            Editar
          </Button>
        </div>

        {noFlightsMessage && (
          <Alert variant="warning" className="text-center mt-4">
            {noFlightsMessage}
          </Alert>
        )}

        {flights.length > 0 && (
          <div className="table-responsive">
            <Table striped bordered hover className="table-sm">
              <thead>
                <tr>
                  <th>Lugar de Partida</th>
                  <th>Lugar de Llegada</th>
                  <th>Precio</th>
                  <th>Horario</th>
                  <th>Fecha</th>
                  <th>Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((flight, index) => (
                  <tr key={index}>
                    <td>{flight.lugarPartida}</td>
                    <td>{flight.lugarDestino}</td>
                    <td>${flight.precio}</td>
                    <td>{flight.horario}</td>
                    <td>{flight.fechaVuelo ? new Date(flight.fechaVuelo).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <Button onClick={() => handleSelectFlight(flight)} variant="primary">Seleccionar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {cart.length > 0 && (
          <>
            <h2 className="text-center mt-4">Vuelos Seleccionados</h2>
            <div className="table-responsive">
              <Table striped bordered hover className="table-sm">
                <thead>
                  <tr>
                    <th>Lugar de Partida</th>
                    <th>Lugar de Llegada</th>
                    <th>Precio</th>
                    <th>Pasajeros</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((flight, index) => (
                    <tr key={index}>
                      <td>{flight.lugarPartida}</td>
                      <td>{flight.lugarDestino}</td>
                      <td>${flight.precio}</td>
                      <td>
                        <Form.Control
                          type="number"
                          value={flight.passengers}
                          min="1"
                          onChange={(e) => handlePassengerChange(index, e.target.value)}
                        />
                      </td>
                      <td>
                        <Button variant="danger" onClick={() => handleRemoveFlight(index)}>
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="payment-section text-center mt-4">
              <Button variant="success" onClick={handlePayment}>
                Pagar
              </Button>
            </div>
          </>
        )}

        {alertMessage && (
          <Alert variant="success" className="mt-4">
            {alertMessage}
          </Alert>
        )}
      </Container>
    </>
  );
};

export default FlightSelection;
