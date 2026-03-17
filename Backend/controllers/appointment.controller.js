import Appointment from "../models/appointment.models.js";
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// 1. Create Appointment (Customer)
const createAppointment = AsyncHandler(async (req, res) => {
    const { date_time, address, geocode } = req.body;

    // Validation
    if (!date_time || !address || !geocode) {
        throw new ApiError(400, "Date, Address, and Geocode are required");
    }

    const appointmentDate = new Date(date_time);
    if (appointmentDate < new Date()) {
        throw new ApiError(400, "Appointment date must be in the future");
    }

    const newAppointment = await Appointment.create({
        customer_id: req.user._id,
        date_time: appointmentDate,
        address,
        geocode,
        status: 'Scheduled'
    });

    return res.status(201).json(
        new ApiResponse(201, "Appointment booked successfully", newAppointment)
    );
});

// 2. Assign Surveyor (Admin/Planner)
const assignSurveyor = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { surveyorId } = req.body;

    if (!surveyorId) throw new ApiError(400, "Surveyor ID is required");

    // RBAC Check
    if (req.user.role !== 'Admin' && req.user.role !== 'Planner') {
        throw new ApiError(403, "Access denied: Only Admin/Planner can assign surveyors");
    }

    const appointment = await Appointment.findByIdAndUpdate(
        id,
        { surveyor_id: surveyorId },
        { new: true }
    );

    if (!appointment) throw new ApiError(404, "Appointment not found");

    return res.status(200).json(
        new ApiResponse(200, "Surveyor assigned successfully", appointment)
    );
});

// 3. Update Status (Surveyor/Admin)
const updateStatus = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) throw new ApiError(404, "Appointment not found");

    // Authorization Check: Only assigned surveyor or Admin can update
    if (req.user.role !== 'Admin' &&
        req.user.role === 'Surveyor' &&
        appointment.surveyor_id?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this appointment");
    }

    appointment.status = status;
    await appointment.save();

    return res.status(200).json(
        new ApiResponse(200, "Appointment status updated", appointment)
    );
});

// 4. Get My Appointments (Customer)
const getMyAppointments = AsyncHandler(async (req, res) => {
    const appointments = await Appointment.find({ customer_id: req.user._id })
        .populate('surveyor_id', 'fullName email')
        .sort({ date_time: 1 });

    return res.status(200).json(
        new ApiResponse(200, "Appointments fetched successfully", appointments)
    );
});

// 5. Get Assigned Tasks (Surveyor)
const getSurveyorTasks = AsyncHandler(async (req, res) => {
    if (req.user.role !== 'Surveyor') throw new ApiError(403, "Access denied");

    const tasks = await Appointment.find({
        surveyor_id: req.user._id,
        status: { $ne: 'Cancelled' }
    })
        .populate('customer_id', 'fullName email')
        .sort('date_time');

    return res.status(200).json(
        new ApiResponse(200, "Tasks fetched successfully", tasks)
    );
});

// 6. Get All Appointments (Agile/Admin view)
const getAllAppointments = AsyncHandler(async (req, res) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Planner') {
        throw new ApiError(403, "Access denied");
    }
    const appointments = await Appointment.find()
        .populate('customer_id', 'fullName email')
        .populate('surveyor_id', 'fullName email')
        .sort({ date_time: -1 });
    return res.status(200).json(
        new ApiResponse(200, "All appointments fetched", appointments)
    );
});

export {
    createAppointment,
    assignSurveyor,
    updateStatus,
    getMyAppointments,
    getSurveyorTasks,
    getAllAppointments
};