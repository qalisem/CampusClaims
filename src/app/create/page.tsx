'use client';
import { useState } from 'react';
import Image from 'next/image';
import Filter from '@/components/Filter';
import { useRouter } from 'next/navigation';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CAMPUS_LOCATIONS = {
    TMU: [
        'Atrium on Bay',
        'Architecture Building — Paul H. Cocker Gallery',
        'Campus Store',
        '114 Bond Street',
        '111 Bond Street',
        'Bell Trinity Square',
        'Carlton Cinema',
        'The Chang School of Continuing Education (Heaslip House)',
        'Creative Innovation Studio',
        'Civil Engineering Storage',
        '101 Gerrard Street East',
        'English Language Institute and International College (College Park)',
        'Centre for Urban Innovation',
        '147 Dalhousie Street',
        'Daphne Cockwell Health Sciences Complex',
        'Yonge-Dundas Square',
        'George Vari Engineering and Computing Centre',
        'Eric Palin Hall',
        'School of Graphic Communications Management (Heidelberg Centre)',
        'International Living / Learning Centre',
        'School of Image Arts',
        'The Image Centre',
        'Jorgenson Hall',
        'Kerr Hall East',
        'Kerr Hall North',
        'Kerr Hall South',
        'Kerr Hall West',
        'Library Building',
        'Mattamy Athletic Centre',
        'Merchandise Building',
        'Civil Engineering Building (Monetary Times)',
        'MaRS Building',
        'Oakham House',
        'O’Keefe House',
        'Pitman Hall',
        'Parking Garage',
        'Podium',
        '112 Bond Street',
        'Recreation and Athletics Centre',
        'Rogers Communications Centre',
        'South Bond Building',
        'Student Campus Centre',
        'Sally Horsfall Eaton Centre for Studies in Community Health',
        'School of Interior Design',
        'Sheldon & Tracy Levy Student Learning Centre',
        'St. Michael’s Hospital',
        'Toronto Eaton Centre',
        'Ted Rogers School of Management',
        'Victoria Building',
        'Yonge-Dundas Intersection',
        '415 Yonge Street',
    ],
    UTM: [
        'Communications, Culture & Technology Building',
        'Deerfield Hall',
        'William G. Davis Building',
        'Hazel McCallion Academic Learning Centre & Library',
        'Terrence Donnelly Health Sciences Complex',
        'Instructional Centre',
        'Kaneff Centre/Innovation Complex',
        'Maanjiwe nendamowinan',
        'New Science Building',
        'Academic Annex',
        'Alumni House & Parking Office',
        'Central Utilities Plant',
        'Early Learning Child Care Centre',
        'Erindale Studio Theatre',
        'Forensic Anthropology Field School',
        'Grounds Building',
        'Lislehurst',
        'Paleomagnetism Lab',
        'Recreation, Athletics & Wellness Centre',
        'Research Greenhouse',
        'Student Centre',
        'Erindale Hall',
        'Leacock Lane Residence',
        'MaGrath Valley Residence',
        'McLuhan Court Residence',
        'Oscar Peterson Hall',
        'Putnam Place Residence',
        'Roy Ivor Hall',
        'Schreiberwood Residence',
    ],
} as const;

const CATEGORIES = [
    'Phone',
    'Wallet',
    'Keys',
    'Laptop',
    'Backpack',
    'Water Bottle',
    'Jewelry',
    'Clothing',
    'Other',
];

const SELECT_BG =
    "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22><path stroke=%22%2364748b%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.5%22 d=%22m6 8 4 4 4-4%22/></svg>')] bg-[right_0.625rem_center] bg-no-repeat pr-9";

export default function CreatePostPage() {
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [campus, setCampus] = useState<'TMU' | 'UTM'>('TMU');
    const [category, setCategory] = useState('');
    const [customItem, setCustomItem] = useState('');
    const [location, setLocation] = useState('');
    const [desc, setDesc] = useState('');
    const [filter, setFilter] = useState<'lost' | 'found'>('lost');
    const [date, setDate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const allowed = selectedFiles.slice(0, 3 - images.length);
        setImages((prev) => [...prev, ...allowed]);
        setPreviews((prev) => [...prev, ...allowed.map((file) => URL.createObjectURL(file))]);
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const fd = new FormData();
        fd.append('post_type', filter);
        fd.append('campus', campus);
        fd.append('title', category === 'Other' ? customItem : category);
        fd.append('location', location);
        fd.append('description', desc);
        images.forEach((image) => fd.append('images', image));
        fd.append('event_date', date);

        const data = await fetch(`/api/create_post`, { method: 'POST', body: fd });
        const res = await data.json();
        setSubmitting(false);

        if (res.success) {
            router.push(`/recommendation/${res.data[0].id}`);
        } else {
            alert('Error creating post: ' + res.error);
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
            <header className="mb-6 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-ink-900">Create a post</h1>
                <p className="text-sm text-ink-500 mt-1">
                    Help your campus reunite items with their owners.
                </p>
            </header>

            <div className="cc-card p-6 sm:p-7">
                <div className="flex justify-center mb-6">
                    <Filter onChange={(v) => setFilter(v)} initial={filter} />
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="campus" className="cc-label">Campus</label>
                        <select
                            id="campus"
                            className={`cc-input ${SELECT_BG}`}
                            value={campus}
                            onChange={(e) => setCampus(e.target.value as 'TMU' | 'UTM')}
                        >
                            <option value="TMU">Toronto Metropolitan University (TMU)</option>
                            <option value="UTM">University of Toronto Mississauga (UTM)</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="category" className="cc-label">Item category</label>
                        <select
                            id="category"
                            className={`cc-input ${SELECT_BG}`}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="">Select an item…</option>
                            {CATEGORIES.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                        {category === 'Other' && (
                            <>
                                <input
                                    type="text"
                                    value={customItem}
                                    onChange={(e) => setCustomItem(e.target.value)}
                                    className="cc-input mt-2"
                                    placeholder="Please specify item…"
                                />
                                <p className="text-xs text-ink-500 mt-1.5">
                                    Custom items may not appear in automated matching results.
                                </p>
                            </>
                        )}
                    </div>

                    <div>
                        <label htmlFor="location" className="cc-label">Location</label>
                        <select
                            id="location"
                            className={`cc-input ${SELECT_BG}`}
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        >
                            <option value="">Select location…</option>
                            {CAMPUS_LOCATIONS[campus].map((loc) => (
                                <option key={loc} value={loc}>
                                    {loc}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="date" className="cc-label">Last seen date</label>
                        <input
                            id="date"
                            type="date"
                            value={date}
                            className="cc-input"
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Image upload */}
                    <div>
                        <span className="cc-label">Photos <span className="font-normal text-ink-400">(max 3)</span></span>
                        <label
                            htmlFor="image-upload"
                            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 transition-colors cursor-pointer ${
                                images.length >= 3
                                    ? 'opacity-50 cursor-not-allowed border-line'
                                    : 'border-line hover:border-brand-500 hover:bg-brand-50/40'
                            }`}
                        >
                            <PhotoIcon className="h-7 w-7 text-ink-400" />
                            <span className="text-sm font-medium text-ink-700">
                                {images.length >= 3 ? 'Maximum reached' : 'Click to upload images'}
                            </span>
                            <span className="text-xs text-ink-500">PNG, JPG up to a few MB each</span>
                        </label>
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageChange}
                            disabled={images.length >= 3}
                        />

                        {previews.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-3">
                                {previews.map((src, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-line">
                                        <Image
                                            src={src}
                                            alt={`Preview ${index + 1}`}
                                            fill
                                            unoptimized
                                            className="object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            aria-label={`Remove image ${index + 1}`}
                                            className="absolute top-1.5 right-1.5 grid place-items-center h-6 w-6 rounded-full bg-white/95 text-danger-600 shadow-sm hover:bg-danger-50"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="desc" className="cc-label">Description</label>
                        <textarea
                            id="desc"
                            rows={4}
                            className="cc-input"
                            placeholder="Identifying details: color, brand, contents, scratches…"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="cc-btn cc-btn-primary w-full !h-12 text-base"
                    >
                        {submitting ? 'Posting…' : 'Submit post'}
                    </button>
                </form>
            </div>
        </div>
    );
}
