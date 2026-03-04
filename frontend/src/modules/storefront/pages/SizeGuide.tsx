/**
 * 📏 PÁGINA DE GUÍA DE TALLAS
 * 
 * Tablas de medidas para ropa y calzado
 */

import { useState } from 'react';
import { Ruler } from 'lucide-react';

type GeneroFiltro = 'todos' | 'mujer' | 'hombre';

export default function SizeGuide() {
  const [generoActivo, setGeneroActivo] = useState<GeneroFiltro>('todos');
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4">
            <Ruler size={32} className="text-white" />
          </div>
          <h1 className="text-5xl font-bebas tracking-wider mb-4">GUÍA DE TALLAS</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Encuentra tu talla perfecta con nuestras tablas de medidas detalladas
          </p>
        </div>

        {/* Selector de Género */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
            <button
              onClick={() => setGeneroActivo('todos')}
              className={`px-6 py-2 rounded-md font-medium transition ${
                generoActivo === 'todos'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setGeneroActivo('mujer')}
              className={`px-6 py-2 rounded-md font-medium transition ${
                generoActivo === 'mujer'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Mujer
            </button>
            <button
              onClick={() => setGeneroActivo('hombre')}
              className={`px-6 py-2 rounded-md font-medium transition ${
                generoActivo === 'hombre'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Hombre
            </button>
          </div>
        </div>

        {/* Consejos de medición */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
          <h3 className="font-bold text-lg mb-3 text-blue-900">Consejos para medir correctamente:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Usa una cinta métrica flexible para obtener medidas precisas</li>
            <li>• Toma las medidas sobre ropa interior, no sobre prendas gruesas</li>
            <li>• Mantén la cinta métrica ajustada pero sin apretar</li>
            <li>• Si estás entre dos tallas, te recomendamos elegir la talla mayor</li>
            <li>• Si tienes dudas, contáctanos al WhatsApp: <strong>999-888-777</strong></li>
          </ul>
        </div>

        {/* TABLA: ROPA MUJER */}
        {(generoActivo === 'todos' || generoActivo === 'mujer') && (
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 pb-4 border-b">Ropa Mujer</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left font-bold">Talla</th>
                  <th className="px-4 py-3 text-center font-bold">Busto (cm)</th>
                  <th className="px-4 py-3 text-center font-bold">Cintura (cm)</th>
                  <th className="px-4 py-3 text-center font-bold">Cadera (cm)</th>
                  <th className="px-4 py-3 text-center font-bold">Equivalencia Internacional</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">XS</td>
                  <td className="px-4 py-3 text-center">80-84</td>
                  <td className="px-4 py-3 text-center">60-64</td>
                  <td className="px-4 py-3 text-center">86-90</td>
                  <td className="px-4 py-3 text-center">32-34 (US 2)</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">S</td>
                  <td className="px-4 py-3 text-center">84-88</td>
                  <td className="px-4 py-3 text-center">64-68</td>
                  <td className="px-4 py-3 text-center">90-94</td>
                  <td className="px-4 py-3 text-center">34-36 (US 4-6)</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">M</td>
                  <td className="px-4 py-3 text-center">88-92</td>
                  <td className="px-4 py-3 text-center">68-72</td>
                  <td className="px-4 py-3 text-center">94-98</td>
                  <td className="px-4 py-3 text-center">38-40 (US 8-10)</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">L</td>
                  <td className="px-4 py-3 text-center">92-96</td>
                  <td className="px-4 py-3 text-center">72-76</td>
                  <td className="px-4 py-3 text-center">98-102</td>
                  <td className="px-4 py-3 text-center">42-44 (US 12-14)</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">XL</td>
                  <td className="px-4 py-3 text-center">96-100</td>
                  <td className="px-4 py-3 text-center">76-80</td>
                  <td className="px-4 py-3 text-center">102-106</td>
                  <td className="px-4 py-3 text-center">46-48 (US 16-18)</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">XXL</td>
                  <td className="px-4 py-3 text-center">100-106</td>
                  <td className="px-4 py-3 text-center">80-86</td>
                  <td className="px-4 py-3 text-center">106-112</td>
                  <td className="px-4 py-3 text-center">50-52 (US 20-22)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        )}

        {/* TABLA: ROPA HOMBRE */}
        {(generoActivo === 'todos' || generoActivo === 'hombre') && (
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 pb-4 border-b">Ropa Hombre</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left font-bold">Talla</th>
                  <th className="px-4 py-3 text-center font-bold">Pecho (cm)</th>
                  <th className="px-4 py-3 text-center font-bold">Cintura (cm)</th>
                  <th className="px-4 py-3 text-center font-bold">Cadera (cm)</th>
                  <th className="px-4 py-3 text-center font-bold">Equivalencia Internacional</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">S</td>
                  <td className="px-4 py-3 text-center">86-91</td>
                  <td className="px-4 py-3 text-center">71-76</td>
                  <td className="px-4 py-3 text-center">86-91</td>
                  <td className="px-4 py-3 text-center">US 34-36</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">M</td>
                  <td className="px-4 py-3 text-center">91-97</td>
                  <td className="px-4 py-3 text-center">76-81</td>
                  <td className="px-4 py-3 text-center">91-97</td>
                  <td className="px-4 py-3 text-center">US 38-40</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">L</td>
                  <td className="px-4 py-3 text-center">97-102</td>
                  <td className="px-4 py-3 text-center">81-86</td>
                  <td className="px-4 py-3 text-center">97-102</td>
                  <td className="px-4 py-3 text-center">US 42-44</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">XL</td>
                  <td className="px-4 py-3 text-center">102-107</td>
                  <td className="px-4 py-3 text-center">86-91</td>
                  <td className="px-4 py-3 text-center">102-107</td>
                  <td className="px-4 py-3 text-center">US 46-48</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">XXL</td>
                  <td className="px-4 py-3 text-center">107-112</td>
                  <td className="px-4 py-3 text-center">91-97</td>
                  <td className="px-4 py-3 text-center">107-112</td>
                  <td className="px-4 py-3 text-center">US 50-52</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        )}

        {/* TABLA: JEANS */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 pb-4 border-b">Jeans (Medida de Cintura)</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left font-bold">Talla</th>
                  <th className="px-4 py-3 text-center font-bold">Cintura (cm)</th>
                  <th className="px-4 py-3 text-center font-bold">Cadera (cm)</th>
                  <th className="px-4 py-3 text-center font-bold">Talla US</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">26</td>
                  <td className="px-4 py-3 text-center">66</td>
                  <td className="px-4 py-3 text-center">90</td>
                  <td className="px-4 py-3 text-center">2</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">28</td>
                  <td className="px-4 py-3 text-center">71</td>
                  <td className="px-4 py-3 text-center">94</td>
                  <td className="px-4 py-3 text-center">4-6</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">30</td>
                  <td className="px-4 py-3 text-center">76</td>
                  <td className="px-4 py-3 text-center">99</td>
                  <td className="px-4 py-3 text-center">8-10</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">32</td>
                  <td className="px-4 py-3 text-center">81</td>
                  <td className="px-4 py-3 text-center">104</td>
                  <td className="px-4 py-3 text-center">12-14</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">34</td>
                  <td className="px-4 py-3 text-center">86</td>
                  <td className="px-4 py-3 text-center">109</td>
                  <td className="px-4 py-3 text-center">16-18</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">36</td>
                  <td className="px-4 py-3 text-center">91</td>
                  <td className="px-4 py-3 text-center">114</td>
                  <td className="px-4 py-3 text-center">20-22</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* TABLA: CALZADO */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 pb-4 border-b">Calzado</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mujer */}
            {(generoActivo === 'todos' || generoActivo === 'mujer') && (
            <div>
              <h3 className="font-bold mb-3 text-lg">Mujer</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left font-bold">Talla PE</th>
                      <th className="px-4 py-3 text-center font-bold">Talla US</th>
                      <th className="px-4 py-3 text-center font-bold">CM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">35</td>
                      <td className="px-4 py-3 text-center">5</td>
                      <td className="px-4 py-3 text-center">22.0</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">36</td>
                      <td className="px-4 py-3 text-center">6</td>
                      <td className="px-4 py-3 text-center">22.5</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">37</td>
                      <td className="px-4 py-3 text-center">7</td>
                      <td className="px-4 py-3 text-center">23.5</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">38</td>
                      <td className="px-4 py-3 text-center">7.5</td>
                      <td className="px-4 py-3 text-center">24.0</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">39</td>
                      <td className="px-4 py-3 text-center">8</td>
                      <td className="px-4 py-3 text-center">24.5</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">40</td>
                      <td className="px-4 py-3 text-center">9</td>
                      <td className="px-4 py-3 text-center">25.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {/* Hombre */}
            {(generoActivo === 'todos' || generoActivo === 'hombre') && (
            <div>
              <h3 className="font-bold mb-3 text-lg">Hombre</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left font-bold">Talla PE</th>
                      <th className="px-4 py-3 text-center font-bold">Talla US</th>
                      <th className="px-4 py-3 text-center font-bold">CM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">39</td>
                      <td className="px-4 py-3 text-center">7</td>
                      <td className="px-4 py-3 text-center">25.0</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">40</td>
                      <td className="px-4 py-3 text-center">7.5</td>
                      <td className="px-4 py-3 text-center">25.5</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">41</td>
                      <td className="px-4 py-3 text-center">8</td>
                      <td className="px-4 py-3 text-center">26.0</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">42</td>
                      <td className="px-4 py-3 text-center">9</td>
                      <td className="px-4 py-3 text-center">27.0</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">43</td>
                      <td className="px-4 py-3 text-center">10</td>
                      <td className="px-4 py-3 text-center">27.5</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">44</td>
                      <td className="px-4 py-3 text-center">11</td>
                      <td className="px-4 py-3 text-center">28.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </div>
        </section>

        {/* CTA de ayuda */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">¿Sigues con dudas sobre tu talla?</h2>
          <p className="mb-6 text-gray-300">
            Contáctanos y te ayudaremos a elegir la talla perfecta
          </p>
          <a
            href="https://wa.me/51999888777"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
