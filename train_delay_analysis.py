"""
RailTrack Analytics: Professional Train Delay Dashboard
------------------------------------------------------
A high-performance analytics system built with Streamlit and Plotly.

Features:
- 3D Surface & Scatter Cluster Analysis
- Geographical Mapbox Integration
- Temporal Distribution & Density Modeling
- KPI Trend Tracking
- Advanced 3D Analytics (Space-Time, Congestion Towers, Vortex)
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta

# --- CONFIGURATION ---
st.set_page_config(
    page_title="RailTrack Analytics | Train Delay System",
    page_icon="🚆",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Bloomberg-style Dark Theme
st.markdown("""
    <style>
    .main { background-color: #050a1f; color: #f1f5f9; }
    .stMetric { background-color: #0f172a; padding: 20px; border-radius: 15px; border: 1px solid #1e293b; }
    div[data-testid="stExpander"] { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 10px; }
    </style>
    """, unsafe_allow_html=True)

class RailAnalyticsEngine:
    def __init__(self):
        self.data = self._load_data()
        
    @st.cache_data
    def _load_data(_self):
        """Generates/Loads high-fidelity train telemetry data."""
        np.random.seed(42)
        n = 1500
        stations = ['Central', 'East', 'West', 'North', 'South']
        zones = ['Northern', 'Southern', 'Eastern', 'Western', 'Central']
        trains = ['Express-101', 'Silver Arrow', 'Midnight Flyer', 'Coastal Link', 'Mountain Climber']
        causes = ['Signal Failure', 'Track Maintenance', 'Weather', 'Technical Fault', 'Congestion']
        
        # Generate base data
        dates = [datetime.now() - timedelta(minutes=np.random.randint(0, 1440)) for _ in range(n)]
        
        df = pd.DataFrame({
            'Train_ID': [f'TRN-{np.random.randint(100, 999)}' for _ in range(n)],
            'Train_Name': [np.random.choice(trains) for _ in range(n)],
            'Station_Name': [np.random.choice(stations) for _ in range(n)],
            'Railway_Zone': [np.random.choice(zones) for _ in range(n)],
            'Arrival_Time': dates,
            'Scheduled_Arrival': dates, # Simplified for demo
            'Lat': np.random.uniform(20.0, 28.0, n),
            'Lng': np.random.uniform(77.0, 85.0, n),
            'Distance_KM': np.random.randint(50, 1000, n),
            'Delay_Minutes': np.random.exponential(scale=15, size=n).astype(int),
            'Cause': [np.random.choice(causes) for _ in range(n)]
        })
        
        # Derived metrics
        df['Hour'] = df['Arrival_Time'].dt.hour
        df['Time_Decimal'] = df['Hour'] + df['Arrival_Time'].dt.minute / 60.0
        df['Speed_KMH'] = np.random.normal(80, 15, n) - (df['Delay_Minutes'] * 0.5) # Speed drops with delay
        df['Speed_KMH'] = df['Speed_KMH'].clip(20, 160)
        df['On_Time'] = df['Delay_Minutes'] < 5
        
        # Add some structure to Lat/Lng based on Zone for better visualization
        zone_coords = {
            'Northern': (28.6, 77.2), 'Southern': (13.0, 80.2), 
            'Eastern': (22.5, 88.3), 'Western': (19.0, 72.8), 
            'Central': (21.1, 79.0)
        }
        
        for i, row in df.iterrows():
            base_lat, base_lng = zone_coords[row['Railway_Zone']]
            df.at[i, 'Lat'] = base_lat + np.random.normal(0, 1.5)
            df.at[i, 'Lng'] = base_lng + np.random.normal(0, 1.5)

        return df

    def plot_packed_bubble_chart(self, df):
        """Replicates the Emerging Delay Clusters (Packed Bubble)"""
        # Group by Zone and Train to get avg delay
        grouped = df.groupby(['Railway_Zone', 'Train_Name'])['Delay_Minutes'].mean().reset_index()
        grouped = grouped[grouped['Delay_Minutes'] > 0]
        
        # Using Scatter with size/color to mimic packed bubbles
        fig = px.scatter(grouped, x='Railway_Zone', y='Delay_Minutes',
                         size='Delay_Minutes', color='Railway_Zone',
                         hover_name='Train_Name', text='Train_Name',
                         size_max=60, template='plotly_dark',
                         title="Emerging Delay Clusters by Zone")
        
        fig.update_traces(marker=dict(line=dict(width=1, color='white')), textposition='top center')
        fig.update_layout(xaxis_title="Railway Zone", yaxis_title="Average Delay (min)", showlegend=False, height=500)
        return fig

    def plot_space_time_cube(self, df):
        """3D Spatiotemporal Trajectories"""
        # Filter top 10 delayed trains for clarity
        top_trains = df.groupby('Train_ID')['Delay_Minutes'].sum().nlargest(10).index
        plot_df = df[df['Train_ID'].isin(top_trains)].sort_values('Arrival_Time')
        
        fig = px.line_3d(plot_df, x='Lng', y='Lat', z='Time_Decimal', color='Train_ID',
                         title="4D Spatiotemporal Trajectories (Space-Time Cube)",
                         template='plotly_dark')
        
        fig.update_traces(line=dict(width=4), marker=dict(size=3))
        fig.update_layout(scene=dict(
            xaxis_title='Longitude', yaxis_title='Latitude', zaxis_title='Time (24h)',
            aspectmode='manual', aspectratio=dict(x=1, y=1, z=0.8)
        ), height=600)
        return fig

    def plot_congestion_towers(self, df):
        """3D Congestion Towers (Hexbin style)"""
        # Bin data spatially
        df['Lat_Bin'] = df['Lat'].round(1)
        df['Lng_Bin'] = df['Lng'].round(1)
        grouped = df.groupby(['Lat_Bin', 'Lng_Bin']).agg({'Delay_Minutes': 'sum', 'Station_Name': 'first'}).reset_index()
        grouped = grouped[grouped['Delay_Minutes'] > 50] # Filter noise
        
        fig = go.Figure()
        
        # Towers
        fig.add_trace(go.Scatter3d(
            x=grouped['Lng_Bin'], y=grouped['Lat_Bin'], z=grouped['Delay_Minutes'],
            mode='markers',
            marker=dict(
                size=8, color=grouped['Delay_Minutes'], colorscale='Portland',
                symbol='square', opacity=0.9
            ),
            text=grouped['Station_Name'],
            name='Delay Volume'
        ))
        
        # Ground Shadow
        fig.add_trace(go.Scatter3d(
            x=grouped['Lng_Bin'], y=grouped['Lat_Bin'], z=[0]*len(grouped),
            mode='markers',
            marker=dict(size=4, color='black', opacity=0.2),
            hoverinfo='skip'
        ))
        
        fig.update_layout(
            title="3D Congestion Towers (Delay Volume)",
            template='plotly_dark',
            scene=dict(xaxis_title='Longitude', yaxis_title='Latitude', zaxis_title='Total Delay (min)'),
            height=600
        )
        return fig

    def plot_radial_delay_rose(self, df):
        """3D Zone-Cause Matrix"""
        grouped = df.groupby(['Railway_Zone', 'Cause'])['Delay_Minutes'].sum().reset_index()
        
        # Map categorical to numeric for 3D plot
        zone_map = {z: i for i, z in enumerate(grouped['Railway_Zone'].unique())}
        cause_map = {c: i for i, c in enumerate(grouped['Cause'].unique())}
        
        fig = go.Figure(data=[go.Scatter3d(
            x=grouped['Railway_Zone'],
            y=grouped['Cause'],
            z=grouped['Delay_Minutes'],
            mode='markers',
            marker=dict(
                size=np.sqrt(grouped['Delay_Minutes']),
                color=grouped['Delay_Minutes'],
                colorscale='Turbo',
                opacity=0.8
            ),
            hovertemplate='Zone: %{x}<br>Cause: %{y}<br>Delay: %{z}m<extra></extra>'
        )])
        
        fig.update_layout(
            title="3D Zone-Cause Matrix",
            template='plotly_dark',
            scene=dict(xaxis_title='Zone', yaxis_title='Cause', zaxis_title='Total Delay'),
            height=600
        )
        return fig

    def plot_velocity_vortex(self, df):
        """3D Velocity Vortex"""
        fig = go.Figure(data=[go.Scatter3d(
            x=df['Distance_KM'],
            y=df['Speed_KMH'],
            z=df['Delay_Minutes'],
            mode='markers',
            marker=dict(
                size=4,
                color=df['Speed_KMH'],
                colorscale='Bluered',
                opacity=0.6
            ),
            text=df['Train_Name'],
            hovertemplate='Dist: %{x}km<br>Speed: %{y:.1f}km/h<br>Delay: %{z}m<extra></extra>'
        )])
        
        fig.update_layout(
            title="Velocity Vortex (Speed vs Distance vs Delay)",
            template='plotly_dark',
            scene=dict(xaxis_title='Distance (km)', yaxis_title='Speed (km/h)', zaxis_title='Delay (min)'),
            height=600
        )
        return fig

    def run_dashboard(self):
        st.title("🚆 RailTrack Exploratory Analytics")
        st.caption("Advanced Visualization System for Train Delay Patterns")
        
        # --- SIDEBAR FILTERS ---
        st.sidebar.header("Control Panel")
        selected_zones = st.sidebar.multiselect("Filter Zones", self.data['Railway_Zone'].unique(), default=self.data['Railway_Zone'].unique())
        
        filtered_df = self.data[self.data['Railway_Zone'].isin(selected_zones)]

        # --- KPI ROW ---
        kpi1, kpi2, kpi3, kpi4 = st.columns(4)
        avg_delay = filtered_df['Delay_Minutes'].mean()
        on_time = (filtered_df['On_Time'].mean() * 100)
        
        kpi1.metric("Avg System Delay", f"{avg_delay:.1f}m", f"{avg_delay-10:.1f}%")
        kpi2.metric("On-Time Performance", f"{on_time:.1f}%", "-2.1%")
        kpi3.metric("Total Incidents", len(filtered_df))
        kpi4.metric("Active Trains", len(filtered_df['Train_ID'].unique()))

        # --- EMERGING CLUSTERS (Packed Bubble) ---
        st.divider()
        st.plotly_chart(self.plot_packed_bubble_chart(filtered_df), use_container_width=True)

        # --- ADVANCED 3D ANALYTICS ---
        st.divider()
        st.subheader("Advanced 3D Analytics")
        
        tab1, tab2 = st.tabs(["Spatiotemporal & Congestion", "Causal & Performance"])
        
        with tab1:
            c1, c2 = st.columns(2)
            with c1:
                st.plotly_chart(self.plot_space_time_cube(filtered_df), use_container_width=True)
            with c2:
                st.plotly_chart(self.plot_congestion_towers(filtered_df), use_container_width=True)
                
        with tab2:
            c3, c4 = st.columns(2)
            with c3:
                st.plotly_chart(self.plot_radial_delay_rose(filtered_df), use_container_width=True)
            with c4:
                st.plotly_chart(self.plot_velocity_vortex(filtered_df), use_container_width=True)

        # --- ORIGINAL CHARTS (Legacy Support) ---
        st.divider()
        with st.expander("Legacy Analysis Views", expanded=False):
            col_left, col_right = st.columns([2, 1])
            with col_left:
                st.subheader("Temporal Delay Evolution")
                fig_timeline = px.line(filtered_df.sort_values('Arrival_Time'), 
                                     x='Arrival_Time', y='Delay_Minutes', color='Railway_Zone',
                                     template='plotly_dark')
                st.plotly_chart(fig_timeline, use_container_width=True)

            with col_right:
                st.subheader("Delay Cause Distribution")
                fig_pie = px.pie(filtered_df, names='Cause', hole=0.6, template='plotly_dark')
                st.plotly_chart(fig_pie, use_container_width=True)

if __name__ == "__main__":
    engine = RailAnalyticsEngine()
    engine.run_dashboard()
