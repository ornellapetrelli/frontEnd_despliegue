import React, { useEffect, useState } from 'react';
import '../Styles/Historial.css';

const Historial = () => {
  const [userFlights, setUserFlights] = useState([]);

  useEffect(() => {
    const obtenerVuelos = async () => {
      try {
        const response = await fetch('/api/vuelos');//completar
        const vuelos = await response.json();
        setUserFlights(vuelos);
      } catch (error) {
        console.error('Error al obtener el historial de vuelos:', error);
      }
    };

    obtenerVuelos();
  }, []);

  return (
    <div className="historial-page">
      <h1>Historial de Viajes</h1>
      {userFlights.length === 0 ? (
        <div className="no-flights-message">
          <p>En esta sección podrás tener un registro de aquellos viajes que fuiste teniendo.</p>
          <p>No tienes viajes registrados.</p>
        </div>
      ) : (
        <ul className="flights-list">
          {userFlights.map((flight, index) => (
            <li key={index} className="flight-item">
              <div className="ticket">
                <div className="ticket-header">
                  <p><strong>Destino:</strong> {flight.lugarDestino}</p>
                  <p><strong>Fecha:</strong> {new Date(flight.fechaVuelo).toLocaleDateString()}</p>
                </div>
                <div className="ticket-body">
                  <p><strong>Precio:</strong> ${flight.precio}</p>
                  <p><strong>Clase:</strong> {flight.claseServicio}</p>
                  <p><strong>Aerolínea:</strong> {flight.aerolinea}</p>
                  <p><strong>Estado de pago:</strong> {flight.estadoPago}</p>
                </div>
                <div className="ticket-footer">
                  <button className="btn-details">Ver detalles</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Historial;
