import React from 'react';
import { Card, Progress, Table, Tag, Divider } from 'antd';
import { 
  CalendarOutlined,
  EnvironmentOutlined,
  AlertOutlined,
  ToolOutlined 
} from '@ant-design/icons';

const ProductionTracking = () => {
  // Données actuelles mai 2025
  const productionData = [
    {
      key: '1',
      culture: 'Banane plantain',
      parcelle: 'P1-Nord',
      superficie: '2.5 ha',
      date: '15/01/2025',
      recolte: '20/07/2025',
      progression: 70,
      etat: 'Floraison',
      interventions: ['Irrigation', 'Désherbage']
    },
    {
      key: '2',
      culture: 'Manioc',
      parcelle: 'P2-Sud',
      superficie: '1.8 ha',
      date: '10/03/2025',
      recolte: '15/10/2025',
      progression: 45,
      etat: 'Croissance',
      interventions: ['Sarclage']
    },
    {
      key: '3',
      culture: 'Piment',
      parcelle: 'Serre-Est',
      superficie: '0.5 ha',
      date: '05/04/2025',
      recolte: 'En cours',
      progression: 30,
      etat: 'Fructification',
      interventions: ['Récolte partielle', 'Fertilisation']
    },
  ];

  const alertes = [
    "Traiter contre les charançons (parcelle P1-Nord avant 25/05)",
    "Réparer le système d'irrigation (P2-Sud)",
    "Commander les sacs de récolte (urgence)"
  ];

  return (
    <div style={{ padding: '16px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#2a5a0c', display: 'flex', alignItems: 'center' }}>
        <EnvironmentOutlined style={{ marginRight: '10px' }} />
        MON SUIVI AGRICOLE - MAI 2025
      </h1>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '12px', 
        margin: '20px 0'
      }}>
        <Card style={{ background: '#f6ffed' }}>
          <h3>Superficie en production</h3>
          <p style={{ fontSize: '24px', margin: '8px 0' }}>4.8 ha</p>
        </Card>

        <Card style={{ background: '#fff7e6' }}>
          <h3>Prochaine récolte</h3>
          <p style={{ fontSize: '24px', margin: '8px 0' }}>Banane P1</p>
          <p>20/07/2025</p>
        </Card>

        <Card style={{ background: '#e6f7ff' }}>
          <h3>Rendement moyen</h3>
          <p style={{ fontSize: '24px', margin: '8px 0' }}>12.5 t/ha</p>
          <p>(saison 2024)</p>
        </Card>
      </div>

      <Card 
        title={<><CalendarOutlined /> CALENDRIER DES INTERVENTIONS</>} 
        style={{ margin: '20px 0' }}
      >
        <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', padding: '5px' }}>
          {['Semis maïs', 'Récolte piment', 'Traitement banane', 'Préparation sol', 'Commande intrants']
            .map((task, i) => (
              <Tag 
                key={i} 
                color={i === 1 ? 'red' : i === 0 ? 'green' : 'blue'}
                style={{ padding: '8px 12px', fontSize: '14px' }}
              >
                {task} {i === 1 && '(URGENT)'}
              </Tag>
            ))}
        </div>
      </Card>

      <Divider orientation="left">MES CULTURES EN COURS</Divider>

      <Table
        columns={[
          {
            title: 'Culture',
            dataIndex: 'culture',
            key: 'culture',
            render: (text, record) => (
              <div>
                <strong>{text}</strong>
                <div style={{ fontSize: '12px', color: '#666' }}>{record.parcelle}</div>
              </div>
            ),
          },
          {
            title: 'Superficie',
            dataIndex: 'superficie',
            key: 'superficie',
          },
          {
            title: 'État',
            dataIndex: 'etat',
            key: 'etat',
          },
          {
            title: 'Avancement',
            dataIndex: 'progression',
            key: 'progression',
            render: (prog) => <Progress percent={prog} size="small" />,
          },
          {
            title: 'Actions',
            dataIndex: 'interventions',
            key: 'actions',
            render: (actions) => (
              <div>
                {actions.map((act, i) => (
                  <Tag key={i} icon={<ToolOutlined />} color="#87d068" style={{ marginBottom: '4px' }}>
                    {act}
                  </Tag>
                ))}
              </div>
            ),
          },
        ]}
        dataSource={productionData}
        pagination={false}
        size="small"
      />

      <Card 
        title={<><AlertOutlined style={{ color: 'red' }} /> ALERTES ET URGENCES</>} 
        style={{ marginTop: '20px', borderLeft: '4px solid red' }}
      >
        <ul style={{ paddingLeft: '20px' }}>
          {alertes.map((alerte, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>
              {alerte} {i === 2 && <Tag color="red">A FAIRE</Tag>}
            </li>
          ))}
        </ul>
      </Card>

      <div style={{ 
        marginTop: '20px', 
        padding: '12px', 
        background: '#f0f5ff', 
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h4 style={{ margin: 0 }}>Prochain rendez-vous technique</h4>
          <p style={{ margin: 0 }}>30/05/2025 - Visite conseiller agricole</p>
        </div>
        <Tag color="blue">A PREPARER</Tag>
      </div>
    </div>
  );
}

export default ProductionTracking;