'use client'

import { useState, useEffect } from 'react'
import { api } from '@/utils/api'
import { UserUpdateRequest, PasswordChangeRequest } from '@/types/auth'

interface ApiResponse<T> {
    success: boolean
    message?: string
    data?: T
}

interface UserProfile {
    id: number
    email: string
    name: string
    phoneNumber?: string
    birthDate?: string
    gender?: 'MALE' | 'FEMALE' | 'OTHER'
    address?: string
    profileImageUrl?: string
    createdAt: string
    lastLoginAt?: string
    status: string
    emailVerified: boolean
}

const UserProfileManagement = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    
    const [formData, setFormData] = useState<UserUpdateRequest>({
        name: '',
        phoneNumber: '',
        birthDate: '',
        gender: undefined,
        address: '',
        profileImageUrl: ''
    })

    // 비밀번호 변경 관련 상태
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [passwordData, setPasswordData] = useState<PasswordChangeRequest>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    })

    // 프로필 정보 로드
    const loadProfile = async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await api.get<ApiResponse<UserProfile>>('/api/user/profile')
            
            if (response.success) {
                const profileData = response.data!
                setProfile(profileData)
                setFormData({
                    name: profileData.name || '',
                    phoneNumber: profileData.phoneNumber || '',
                    birthDate: profileData.birthDate || '',
                    gender: profileData.gender || undefined,
                    address: profileData.address || '',
                    profileImageUrl: profileData.profileImageUrl || ''
                })
            } else {
                setError(response.message || '프로필 정보를 불러올 수 없습니다.')
            }
        } catch (error) {
            console.error('프로필 로드 실패:', error)
            setError('프로필 정보를 불러오는 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    // 프로필 업데이트
    const updateProfile = async () => {
        try {
            setSaving(true)
            setError(null)
            setSuccessMessage(null)

            // 빈 값들은 제거하여 전송
            const updateData: UserUpdateRequest = {}
            if (formData.name?.trim()) updateData.name = formData.name.trim()
            if (formData.phoneNumber?.trim()) updateData.phoneNumber = formData.phoneNumber.trim()
            if (formData.birthDate) updateData.birthDate = formData.birthDate
            if (formData.gender) updateData.gender = formData.gender
            if (formData.address?.trim()) updateData.address = formData.address.trim()
            if (formData.profileImageUrl?.trim()) updateData.profileImageUrl = formData.profileImageUrl.trim()

            const response = await api.put<ApiResponse<UserProfile>>('/api/user/profile', updateData)
            
            if (response.success) {
                setProfile(response.data!)
                setSuccessMessage('프로필이 성공적으로 업데이트되었습니다.')
                setIsEditing(false)
            } else {
                setError(response.message || '프로필 업데이트에 실패했습니다.')
            }
        } catch (error) {
            console.error('프로필 업데이트 실패:', error)
            setError('프로필 업데이트 중 오류가 발생했습니다.')
        } finally {
            setSaving(false)
        }
    }

    const handleInputChange = (field: keyof UserUpdateRequest, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleCancel = () => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                phoneNumber: profile.phoneNumber || '',
                birthDate: profile.birthDate || '',
                gender: profile.gender || undefined,
                address: profile.address || '',
                profileImageUrl: profile.profileImageUrl || ''
            })
        }
        setIsEditing(false)
        setError(null)
        setSuccessMessage(null)
    }

    // 비밀번호 변경 관련 함수들
    const handlePasswordInputChange = (field: keyof PasswordChangeRequest, value: string) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }))
        if (error) setError(null)
        if (successMessage) setSuccessMessage(null)
    }

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }))
    }

    const handlePasswordChange = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setError('모든 비밀번호 필드를 입력해주세요.')
            return
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.')
            return
        }

        if (passwordData.currentPassword === passwordData.newPassword) {
            setError('새 비밀번호는 현재 비밀번호와 달라야 합니다.')
            return
        }

        try {
            setSaving(true)
            setError(null)
            setSuccessMessage(null)

            const response = await api.patch<ApiResponse<null>>('/api/user/password', passwordData)
            
            if (response.success) {
                setSuccessMessage('비밀번호가 성공적으로 변경되었습니다.')
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
                setIsChangingPassword(false)
            } else {
                setError(response.message || '비밀번호 변경에 실패했습니다.')
            }
        } catch (error) {
            console.error('비밀번호 변경 실패:', error)
            setError('비밀번호 변경 중 오류가 발생했습니다.')
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordCancel = () => {
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        })
        setIsChangingPassword(false)
        setError(null)
        setSuccessMessage(null)
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return '설정되지 않음'
        try {
            return new Date(dateString).toLocaleDateString('ko-KR')
        } catch {
            return dateString
        }
    }

    const getGenderText = (gender?: string) => {
        switch (gender) {
            case 'MALE': return '남성'
            case 'FEMALE': return '여성'
            case 'OTHER': return '기타'
            default: return '설정되지 않음'
        }
    }

    useEffect(() => {
        loadProfile()
    }, [])

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">기본 정보</h2>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                        >
                            수정하기
                        </button>
                    ) : (
                        <div className="flex space-x-2">
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={updateProfile}
                                disabled={isSaving}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center"
                            >
                                {isSaving && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                )}
                                {isSaving ? '저장 중...' : '저장하기'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6">
                {/* 에러 메시지 */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* 성공 메시지 */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm">{successMessage}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 이메일 (읽기 전용) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                            {profile?.email}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다</p>
                    </div>

                    {/* 이름 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="이름을 입력하세요"
                                minLength={2}
                                maxLength={50}
                            />
                        ) : (
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                {profile?.name || '설정되지 않음'}
                            </div>
                        )}
                    </div>

                    {/* 전화번호 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="010-0000-0000"
                                pattern="010-\d{4}-\d{4}"
                            />
                        ) : (
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                {profile?.phoneNumber || '설정되지 않음'}
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">010-0000-0000 형식으로 입력하세요</p>
                    </div>

                    {/* 생년월일 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">생년월일</label>
                        {isEditing ? (
                            <input
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        ) : (
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                {formatDate(profile?.birthDate)}
                            </div>
                        )}
                    </div>

                    {/* 성별 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
                        {isEditing ? (
                            <select
                                value={formData.gender || ''}
                                onChange={(e) => handleInputChange('gender', e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">선택하세요</option>
                                <option value="MALE">남성</option>
                                <option value="FEMALE">여성</option>
                                <option value="OTHER">기타</option>
                            </select>
                        ) : (
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                {getGenderText(profile?.gender)}
                            </div>
                        )}
                    </div>

                    {/* 주소 */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
                        {isEditing ? (
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="주소를 입력하세요"
                                rows={2}
                            />
                        ) : (
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg min-h-[60px]">
                                {profile?.address || '설정되지 않음'}
                            </div>
                        )}
                    </div>
                </div>

                {/* 비밀번호 변경 */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">비밀번호 변경</h3>
                        {!isChangingPassword ? (
                            <button
                                onClick={() => setIsChangingPassword(true)}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                            >
                                변경하기
                            </button>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handlePasswordCancel}
                                    disabled={isSaving}
                                    className="px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm disabled:opacity-50"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handlePasswordChange}
                                    disabled={isSaving}
                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50"
                                >
                                    {isSaving ? '변경 중...' : '변경'}
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {!isChangingPassword ? (
                        <p className="text-gray-600 text-sm">
                            계정 보안을 위해 정기적으로 비밀번호를 변경하는 것을 권장합니다.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* 현재 비밀번호 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">현재 비밀번호</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        placeholder="현재 비밀번호"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('current')}
                                        className="absolute inset-y-0 right-0 pr-2 flex items-center"
                                    >
                                        <span className="text-gray-400 text-xs">
                                            {showPasswords.current ? '🙈' : '👁️'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* 새 비밀번호 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        placeholder="새 비밀번호"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('new')}
                                        className="absolute inset-y-0 right-0 pr-2 flex items-center"
                                    >
                                        <span className="text-gray-400 text-xs">
                                            {showPasswords.new ? '🙈' : '👁️'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* 새 비밀번호 확인 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호 확인</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        placeholder="비밀번호 확인"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        className="absolute inset-y-0 right-0 pr-2 flex items-center"
                                    >
                                        <span className="text-gray-400 text-xs">
                                            {showPasswords.confirm ? '🙈' : '👁️'}
                                        </span>
                                    </button>
                                </div>
                                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                                    <p className="text-red-600 text-xs mt-1">비밀번호가 일치하지 않습니다.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 계정 정보 */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">계정 정보</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">가입일</label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                {formatDate(profile?.createdAt)}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">최근 로그인</label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                {formatDate(profile?.lastLoginAt)}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">계정 상태</label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    profile?.status === 'ACTIVE' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {profile?.status === 'ACTIVE' ? '활성' : '비활성'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">이메일 인증</label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    profile?.emailVerified 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {profile?.emailVerified ? '인증됨' : '미인증'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfileManagement 