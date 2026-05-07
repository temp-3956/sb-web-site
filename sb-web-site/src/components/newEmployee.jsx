import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function NewEmployeesPage({ user }) {
    const [employees, setEmployees] = useState([]);

    const [form, setForm] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        display_name: "",
        start_date: "",
        end_date: "",
        department: ""
    });

    const [editingId, setEditingId] = useState(null);

    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    const isManagement = user?.roles?.includes("management");

    const getHeaders = () => {
        const token = localStorage.getItem("token");

        return {
            "Content-Type": "application/json",
            ...(token
                ? { Authorization: `Bearer ${token}` }
                : {})
        };
    };

    const formatDate = (date) => {
        if (!date) return "";
        return date.split("T")[0];
    };

    const fetchEmployees = async () => {
        let url = `${API}/new-employees`;

        if (statusFilter === "active") {
            url = `${API}/new-employees/active`;
        }

        if (statusFilter === "inactive") {
            url = `${API}/new-employees/inactive`;
        }

        if (statusFilter === "pending") {
            url = `${API}/new-employees/pending`;
        }

        const res = await fetch(url, {
            headers: getHeaders()
        });

        const data = await res.json();

        let list = Array.isArray(data)
            ? data
            : [];

        if (search) {
            list = list.filter(emp =>
                emp.username
                    ?.toLowerCase()
                    .includes(search.toLowerCase())
            );
        }

        setEmployees(list);
    };

    useEffect(() => {
        fetchEmployees();
    }, [statusFilter, search]);

    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const resetForm = () => {
        setForm({
            username: "",
            email: "",
            first_name: "",
            last_name: "",
            display_name: "",
            start_date: "",
            end_date: "",
            department: ""
        });

        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...form,
            start_date: formatDate(form.start_date)
        };

        if (editingId) {
            payload.end_date = formatDate(form.end_date);
        } else {
            delete payload.end_date;
        }

        const url = editingId
            ? `${API}/new-employees/${editingId}`
            : `${API}/new-employees`;

        const method = editingId
            ? "PUT"
            : "POST";

        await fetch(url, {
            method,
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        resetForm();
        fetchEmployees();
    };

    const handleEdit = (emp) => {
        setForm({
            username: emp.username || "",
            email: emp.email || "",
            first_name: emp.first_name || "",
            last_name: emp.last_name || "",
            display_name: emp.display_name || "",
            start_date: formatDate(emp.start_date),
            end_date: formatDate(emp.end_date),
            department: emp.department || ""
        });

        setEditingId(emp.employee_id);
    };

    const handleDelete = async (id) => {
        await fetch(`${API}/new-employees/${id}`, {
            method: "DELETE",
            headers: getHeaders()
        });

        fetchEmployees();
    };

    const handleActivate = async (id) => {
        await fetch(`${API}/new-employees/activate/${id}`, {
            method: "PUT",
            headers: getHeaders()
        });

        fetchEmployees();
    };

    const handleDeactivate = async (id) => {
        await fetch(`${API}/new-employees/deactivate/${id}`, {
            method: "PUT",
            headers: getHeaders()
        });

        fetchEmployees();
    };

    return (
        <div className="container employee-page">

            <div className="card">
                <h2>
                    {editingId
                        ? "Update Employee"
                        : "New Employees"}
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="employee-form"
                >

                    <input
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="first_name"
                        placeholder="First Name"
                        value={form.first_name}
                        onChange={handleChange}
                    />

                    <input
                        name="last_name"
                        placeholder="Last Name"
                        value={form.last_name}
                        onChange={handleChange}
                    />

                    <input
                        name="display_name"
                        placeholder="Display Name"
                        value={form.display_name}
                        onChange={handleChange}
                    />

                    <div className="employee-date-group">

                        <div className="employee-date-field">
                            <label className="small">
                                Start Date
                            </label>

                            <input
                                name="start_date"
                                type="date"
                                value={form.start_date}
                                onChange={handleChange}
                            />
                        </div>

                        {editingId && (
                            <div className="employee-date-field">
                                <label className="small">
                                    End Date
                                </label>

                                <input
                                    name="end_date"
                                    type="date"
                                    value={form.end_date}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                    </div>

                    <input
                        name="department"
                        placeholder="Department"
                        value={form.department}
                        onChange={handleChange}
                    />

                    <div className="employee-actions">

                        <button className="btn-blue">
                            {editingId
                                ? "Update"
                                : "Create"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="btn-gray"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                </form>
            </div>

            <div className="card">

                <div className="filter-row wrap">

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <input
                        placeholder="Search username..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    <button
                        className="btn-gray"
                        onClick={fetchEmployees}
                    >
                        Refresh
                    </button>

                </div>

                <table className="employee-table">

                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {employees.map(emp => (
                            <tr key={emp.employee_id}>

                                <td>{emp.username}</td>

                                <td className="small">
                                    {emp.email}
                                </td>

                                <td>
                                    {emp.department || "-"}
                                </td>

                                <td>
                                    {formatDate(emp.start_date) || "-"}
                                </td>

                                <td>
                                    {formatDate(emp.end_date) || "-"}
                                </td>

                                <td>
                                    <span className={`badge status-${emp.status}`}>
                                        {emp.status}
                                    </span>
                                </td>

                                <td>

                                    <div className="employee-actions">

                                        <button
                                            className="btn-gray"
                                            onClick={() => handleEdit(emp)}
                                        >
                                            Edit
                                        </button>
                                        
                                        {isManagement && (
                                            <button
                                                className="btn-red"
                                                onClick={() => handleDelete(emp.employee_id)}
                                            >
                                                Delete
                                            </button>
                                        )}

                                        <button
                                            className="btn-green"
                                            onClick={() => handleActivate(emp.employee_id)}
                                        >
                                            Activate
                                        </button>

                                        <button
                                            className="btn-gray"
                                            onClick={() => handleDeactivate(emp.employee_id)}
                                        >
                                            Deactivate
                                        </button>

                                    </div>

                                </td>

                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}