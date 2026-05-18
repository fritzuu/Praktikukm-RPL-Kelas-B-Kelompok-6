import { router } from '@inertiajs/react';
import AslabLayout from '../../Layouts/AslabLayout';
import ValidationQueue from '../../Components/Aslab/ValidationQueue';

export default function AslabValidation({ pending = [], recent = [] }) {
    const handleForward = (id, notes) => {
        router.post(route('aslab.validasi.forward', id), { notes }, {
            preserveScroll: true,
        });
    };

    const handleReject = (id, notes) => {
        router.post(route('aslab.validasi.reject', id), { notes }, {
            preserveScroll: true,
        });
    };

    return (
        <div className="space-y-6">
            <ValidationQueue
                pending={pending}
                recent={recent}
                onForward={handleForward}
                onReject={handleReject}
            />
        </div>
    );
}

AslabValidation.layout = (page) => <AslabLayout>{page}</AslabLayout>;
