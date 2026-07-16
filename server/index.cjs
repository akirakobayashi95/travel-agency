const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, "data", "bookings.json");

function ensureDataFile() {
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ bookings: [], counters: {} }, null, 2));
  }
}

function readData() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateBookingCode(date) {
  const d = new Date(date);
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  const data = readData();
  const counterKey = `BK${ymd}`;
  const count = (data.counters[counterKey] || 0) + 1;
  data.counters[counterKey] = count;
  writeData(data);
  return `BK${ymd}${String(count).padStart(4, "0")}`;
}

// Validation
function validateBooking(body) {
  const errors = [];
  if (!body.contact) errors.push("Thiếu thông tin liên hệ");
  if (!body.contact?.fullName?.trim()) errors.push("Họ tên không được để trống");
  if (!body.contact?.phone?.trim()) errors.push("Số điện thoại không được để trống");
  if (!/^[0-9+\-\s]{10,11}$/.test(body.contact?.phone || ""))
    errors.push("Số điện thoại không đúng định dạng");
  if (!body.contact?.email?.trim()) errors.push("Email không được để trống");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contact?.email || ""))
    errors.push("Email không hợp lệ");
  if (!body.packageId) errors.push("Thiếu mã tour");
  if (!body.departureDate) errors.push("Thiếu ngày khởi hành");
  if (!body.pickupPoint?.trim()) errors.push("Thiếu điểm đón");
  const travelers = body.travelers || {};
  const total = (travelers.adults || 0) + (travelers.children || 0) + (travelers.infants || 0);
  if (total < 1) errors.push("Phải có ít nhất 1 khách");
  if (!body.pricing?.total || body.pricing.total <= 0)
    errors.push("Tổng tiền không hợp lệ");
  return errors;
}

// POST /api/booking
app.post("/api/booking", (req, res) => {
  const errors = validateBooking(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const now = new Date().toISOString();
  const booking = {
    id: crypto.randomUUID(),
    code: generateBookingCode(req.body.departureDate),
    status: "pending",
    contact: req.body.contact,
    packageId: req.body.packageId,
    packageTitle: req.body.packageTitle || "",
    departureDate: req.body.departureDate,
    pickupPoint: req.body.pickupPoint,
    travelers: req.body.travelers,
    pricing: req.body.pricing,
    payment: {
      method: req.body.payment?.method || "office",
      amount: req.body.payment?.amount || req.body.pricing.total,
      paidAt: null,
    },
    createdAt: now,
    updatedAt: now,
  };

  const data = readData();
  data.bookings.push(booking);
  writeData(data);

  // TODO: Send email notification
  console.log(`Booking ${booking.code} created for ${booking.contact.email}`);

  res.status(201).json({ success: true, data: booking });
});

// GET /api/booking/:id
app.get("/api/booking/:id", (req, res) => {
  const data = readData();
  const booking = data.bookings.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ success: false, error: "Không tìm thấy booking" });
  res.json({ success: true, data: booking });
});

// GET /api/booking/code/:code
app.get("/api/booking/code/:code", (req, res) => {
  const data = readData();
  const booking = data.bookings.find((b) => b.code === req.params.code);
  if (!booking) return res.status(404).json({ success: false, error: "Không tìm thấy booking" });
  res.json({ success: true, data: booking });
});

// PUT /api/booking/:id — update status
app.put("/api/booking/:id", (req, res) => {
  const data = readData();
  const idx = data.bookings.findIndex((b) => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Không tìm thấy booking" });

  const allowedStatuses = ["pending", "confirmed", "paid", "completed", "cancelled"];
  if (req.body.status && !allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({ success: false, error: "Trạng thái không hợp lệ" });
  }

  data.bookings[idx] = {
    ...data.bookings[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  writeData(data);
  res.json({ success: true, data: data.bookings[idx] });
});

// DELETE /api/booking/:id
app.delete("/api/booking/:id", (req, res) => {
  const data = readData();
  const idx = data.bookings.findIndex((b) => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Không tìm thấy booking" });
  data.bookings.splice(idx, 1);
  writeData(data);
  res.json({ success: true });
});

// Admin: GET /api/admin/bookings?status=&search=&sort=&page=
app.get("/api/admin/bookings", (req, res) => {
  const data = readData();
  let bookings = [...data.bookings];

  const { status, search, sort, page = 1, limit = 10 } = req.query;

  if (status && status !== "all") {
    bookings = bookings.filter((b) => b.status === status);
  }

  if (search) {
    const s = search.toLowerCase();
    bookings = bookings.filter(
      (b) =>
        b.code.toLowerCase().includes(s) ||
        b.contact.fullName.toLowerCase().includes(s) ||
        b.contact.email.toLowerCase().includes(s) ||
        b.packageTitle.toLowerCase().includes(s)
    );
  }

  if (sort === "date_asc") bookings.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  else if (sort === "date_desc") bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else if (sort === "price_asc") bookings.sort((a, b) => a.pricing.total - b.pricing.total);
  else if (sort === "price_desc") bookings.sort((a, b) => b.pricing.total - a.pricing.total);
  else bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = bookings.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  const paginated = bookings.slice(start, start + parseInt(limit));

  res.json({
    success: true,
    data: {
      bookings: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

app.listen(PORT, () => {
  console.log(`Booking API server running on http://localhost:${PORT}`);
});