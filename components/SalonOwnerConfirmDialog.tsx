'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SalonOwnerConfirmDialogProps {
	open: boolean;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	loading?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export default function SalonOwnerConfirmDialog({
	open,
	title,
	description,
	confirmLabel = 'Delete',
	cancelLabel = 'Cancel',
	loading = false,
	onConfirm,
	onCancel,
}: SalonOwnerConfirmDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onCancel() : null)}>
			<AlertDialogContent className="max-w-md border-[#e8dcc0] bg-white p-0 shadow-2xl">
				<div className="h-1.5 w-full bg-[#C8A84B]" />
				<AlertDialogHeader className="px-6 pt-5 text-left">
					<AlertDialogTitle className="font-playfair text-2xl text-gray-900">
						{title}
					</AlertDialogTitle>
					<AlertDialogDescription className="text-sm leading-6 text-gray-600">
						{description}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="px-6 pb-6 pt-2 sm:justify-end">
					<AlertDialogCancel
						disabled={loading}
						className="border-[#d8c28a] bg-[#fff8e8] text-[#7a6326] hover:bg-[#f5e3b8]"
					>
						{cancelLabel}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={loading}
						className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
					>
						{loading ? 'Deleting...' : confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
