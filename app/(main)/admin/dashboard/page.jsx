// app/(main)/admin/dashboard/page.jsx
"use client";

import { Knob } from "primereact/knob";
import { useEffect, useState } from "react";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import { useRef } from "react";

const AdminDashboard = () => {
    // Static dummy data
    const dashboardData = {
        totalWorkOrders: 10,
        overdueWorkOrders: 2,
        closedWorkOrders: 7,
        totalIssues: 5,
        openIssues: 2,
        inProgressIssues: 1,
        resolvedIssues: 2,
        totalMachines: 4,
        offlineMachines: 1,
        lowStockParts: 3,
        mttr: '2.5H',
        mtbf: '7.9H',
        maintenanceExpenses: 100.76
    };
    const completionRate = Math.round((dashboardData.closedWorkOrders / dashboardData.totalWorkOrders) * 100);
    const overdueRate = Math.round((dashboardData.overdueWorkOrders / dashboardData.totalWorkOrders) * 100);
    return (
        <div className="card">
            <h2 className="font-semibold">Admin Dashboard</h2>
            <div className="grid">
                <div className="col-12 md:col-6">
                    <div className="card flex align-items-center justify-content-center overflow-hidden" style={{ minHeight: "575px", flexDirection: "column" }}>
                        <div className="text-center mb-3">
                            <h4 className="font-bold">WORK ORDER ON-TIME COMPLETION RATE</h4>
                            <p>All Assets & All Groups</p>
                        </div>
                        <Knob value={completionRate} valueTemplate={"{value}%"} readOnly size={250} />
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <div className="card flex align-items-center justify-content-center overflow-hidden" style={{ height: "280px", flexDirection: "column" }}>
                                <div className="text-center mb-3">
                                    <h6 className="font-bold">OVERDUE WORK ORDERS</h6>
                                    <p>All Assets & All Groups</p>
                                </div>
                                <Knob
                                    value={dashboardData.overdueWorkOrders}
                                    max={dashboardData.totalWorkOrders || 100}
                                    valueTemplate={`{value} of ${dashboardData.totalWorkOrders}`}
                                    readOnly
                                    strokeWidth={8}
                                    valueColor="#ef4444"
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="card flex align-items-center justify-content-center overflow-hidden" style={{ height: "280px", flexDirection: "column" }}>
                                <div className="text-center mb-3">
                                    <h6 className="font-bold">CLOSED WORK ORDERS</h6>
                                    <p>All Assets & All Groups</p>
                                </div>
                                <h3>{dashboardData.closedWorkOrders}</h3>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="card flex align-items-center justify-content-center overflow-hidden" style={{ height: "280px", flexDirection: "column" }}>
                                <div className="text-center mb-3">
                                    <h6 className="font-bold">OPEN WORK REQUESTS</h6>
                                    <p>All Assets & All Groups</p>
                                </div>
                                <h3 className="text-yellow-500">{dashboardData.openIssues}</h3>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="card flex align-items-center justify-content-center overflow-hidden" style={{ height: "280px", flexDirection: "column" }}>
                                <div className="text-center mb-3">
                                    <h6 className="font-bold">MTTR (FROM WORK ORDER)</h6>
                                    <p>All Assets</p>
                                </div>
                                <h3>{dashboardData.mttr || 'N/A'}</h3>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="card flex align-items-center justify-content-center overflow-hidden" style={{ height: "280px", flexDirection: "column" }}>
                                <div className="text-center mb-3">
                                    <h6 className="font-bold">CURRENT OFFLINE ASSETS</h6>
                                    <p>All Assets</p>
                                </div>
                                <h3>{dashboardData.offlineMachines}</h3>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="card flex align-items-center justify-content-center overflow-hidden" style={{ height: "280px", flexDirection: "column" }}>
                                <div className="text-center mb-3">
                                    <h6 className="font-bold">LOW STOCK ITEMS</h6>
                                    <p>All Assets</p>
                                </div>
                                <h3 className="text-yellow-500">{dashboardData.lowStockParts}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-2">
                    <div className="card flex align-items-center justify-content-center overflow-hidden" style={{ flexDirection: "column" }}>
                        <div className="text-center mb-3">
                            <h6 className="font-bold">MTBF (FROM AVAILABILITY TRACKER)</h6>
                            <p>All Assets</p>
                        </div>
                        <h3>{dashboardData.mtbf}</h3>
                    </div>
                </div>
                <div className="col-12 md:col-2">
                    <div className="card flex align-items-center justify-content-center overflow-hidden" style={{ flexDirection: "column" }}>
                        <div className="text-center mb-3">
                            <h6 className="font-bold">MAINTENANCE EXPENSES</h6>
                            <p>All Assets</p>
                        </div>
                        <h3>${dashboardData.maintenanceExpenses}</h3>
                    </div>
                </div>
                <div className="col-12 md:col-2">
                    <div className="card flex align-items-center justify-content-center overflow-hidden" style={{ flexDirection: "column" }}>
                        <div className="text-center mb-3">
                            <h6 className="font-bold">TOTAL WORK ORDERS</h6>
                            <p>All Assets</p>
                        </div>
                        <h3>{dashboardData.totalWorkOrders}</h3>
                    </div>
                </div>
                <div className="col-12 md:col-2">
                    <div className="card flex align-items-center justify-content-center overflow-hidden" style={{ flexDirection: "column" }}>
                        <div className="text-center mb-3">
                            <h6 className="font-bold">IN PROGRESS ISSUES</h6>
                            <p>All Assets</p>
                        </div>
                        <h3 className="text-blue-500">{dashboardData.inProgressIssues}</h3>
                    </div>
                </div>
                <div className="col-12 md:col-2">
                    <div className="card flex align-items-center justify-content-center overflow-hidden" style={{ flexDirection: "column" }}>
                        <div className="text-center mb-3">
                            <h6 className="font-bold">TOTAL MACHINES</h6>
                            <p>All Assets</p>
                        </div>
                        <h3>{dashboardData.totalMachines}</h3>
                    </div>
                </div>
                <div className="col-12 md:col-2">
                    <div className="card flex align-items-center justify-content-center overflow-hidden" style={{ flexDirection: "column" }}>
                        <div className="text-center mb-3">
                            <h6 className="font-bold">RESOLVED ISSUES</h6>
                            <p>All Assets</p>
                        </div>
                        <h3 className="text-green-500">{dashboardData.resolvedIssues}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
