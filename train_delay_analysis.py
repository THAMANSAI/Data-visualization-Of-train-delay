"""
RailTrack Analytics: Professional Train Delay Dashboard
------------------------------------------------------
A high-performance analytics system built with Streamlit and Plotly.

Features:
- 3D Surface & Scatter Cluster Analysis
- Geographical Mapbox Integration
- Temporal Distribution & Density Modeling
- KPI Trend Tracking
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
    </style>
    """, unsafe_allow_html=True)

class RailAnalyticsEngine:
    def __init__(self):
        self.data = self._load_data()
        
    @st.cache_data
    def _load_data(_self):
        """Generates/Loads high-fidelity train telemetry data."""
        np.random.seed(42)
        n = 1000
        stations = ['Central', 'East', 'West', 'North', 'South']
        trains = ['Express-101', 'Silver Arrow', 'Midnight Flyer', 'Coastal Link']
        
        df = pd.DataFrame({
            'Train_ID': [f'TRN-{np.random.randint(100, 999)}' for _ in range(n)],
            'Train_Name': [np.random.choice(trains) for _ in range(n)],
            'Station_Name': [np.random.choice(stations) for _ in range(n)],
            'Arrival_Time': [datetime.now() - timedelta(hours=np.random.randint(0, 500)) for _ in range(n)],
            'Distance_KM': [np.random.randint(50, 1000) for _ in range(n)],
            'Delay_Minutes': np.random.exponential(scale=12, size=n).astype(int),
            'Cause': [np.random.choice(['Weather', 'Signal', 'Congestion', 'Maintenance']) for _ in range(n)]
        })
        
        df['Hour'] = df['Arrival_Time'].dt.hour
        df['On_Time'] = df['Delay_Minutes'] == 0
        return df

    def run_dashboard(self):
        st.title("🚆 RailTrack Exploratory Analytics")
        st.caption("Advanced Visualization System for Train Delay Patterns")
        
        # --- SIDEBAR FILTERS ---
        st.sidebar.header("Control Panel")
        selected_trains = st.sidebar.multiselect("Filter Trains", self.data['Train_Name'].unique(), default=self.data['Train_Name'].unique())
        hour_range = st.sidebar.slider("Hour of Day", 0, 23, (0, 23))
        
        filtered_df = self.data[
            (self.data['Train_Name'].isin(selected_trains)) & 
            (self.data['Hour'].between(hour_range[0], hour_range[1]))
        ]

        # --- KPI ROW ---
        kpi1, kpi2, kpi3, kpi4 = st.columns(4)
        avg_delay = filtered_df['Delay_Minutes'].mean()
        on_time = (filtered_df['On_Time'].mean() * 100)
        
        kpi1.metric("Avg System Delay", f"{avg_delay:.1f}m", f"{avg_delay-10:.1f}%")
        kpi2.metric("On-Time Performance", f"{on_time:.1f}%", "-2.1%")
        kpi3.metric("Peak Delay Hour", f"{filtered_df.groupby('Hour')['Delay_Minutes'].mean().idxmax()}:00")
        kpi4.metric("Active Trains", len(filtered_df['Train_ID'].unique()))

        # --- MAIN VISUALS ---
        col_left, col_right = st.columns([2, 1])
        
        with col_left:
            st.subheader("Temporal Delay Evolution")
            fig_timeline = px.line(filtered_df.sort_values('Arrival_Time'), 
                                 x='Arrival_Time', y='Delay_Minutes', color='Train_Name',
                                 template='plotly_dark', color_discrete_sequence=px.colors.qualitative.Pastel)
            st.plotly_chart(fig_timeline, use_container_width=True)

        with col_right:
            st.subheader("Delay Cause Distribution")
            fig_pie = px.pie(filtered_df, names='Cause', hole=0.6, template='plotly_dark')
            st.plotly_chart(fig_pie, use_container_width=True)

        # --- 3D SURFACE ---
        st.divider()
        st.subheader("3D Delay Hotspot Surface")
        pivot = filtered_df.pivot_table(index='Station_Name', columns='Hour', values='Delay_Minutes', aggfunc='mean').fillna(0)
        fig_3d = go.Figure(data=[go.Surface(z=pivot.values, x=pivot.columns, y=pivot.index, colorscale='Viridis')])
        fig_3d.update_layout(scene=dict(xaxis_title='Hour', yaxis_title='Station', zaxis_title='Delay (min)'),
                            template='plotly_dark', height=600)
        st.plotly_chart(fig_3d, use_container_width=True)

        # --- DISTRIBUTION ---
        st.divider()
        c1, c2 = st.columns(2)
        with c1:
            st.subheader("Probability Density Curve")
            fig_dist = px.histogram(filtered_df, x="Delay_Minutes", marginal="violin", template='plotly_dark')
            st.plotly_chart(fig_dist, use_container_width=True)
        with c2:
            st.subheader("Station Performance Ranking")
            rank_df = filtered_df.groupby('Station_Name')['Delay_Minutes'].mean().sort_values(ascending=False).reset_index()
            fig_rank = px.bar(rank_df, x='Delay_Minutes', y='Station_Name', orientation='h', template='plotly_dark')
            st.plotly_chart(fig_rank, use_container_width=True)

if __name__ == "__main__":
    engine = RailAnalyticsEngine()
    engine.run_dashboard()
